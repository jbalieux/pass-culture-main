import datetime
import logging
import typing

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import joinedload

from pcapi.core.external.attributes import api as external_attributes_api
import pcapi.core.finance.conf as finance_conf
import pcapi.core.finance.models as finance_models
import pcapi.core.mails.transactional as transactional_mails
from pcapi.core.subscription import api as subscription_api
from pcapi.core.users import api as users_api
from pcapi.core.users import models as users_models
from pcapi.models import db
from pcapi.repository import transaction


logger = logging.getLogger(__name__)

RECREDIT_BATCH_SIZE = 1000


def has_celebrated_birthday_since_registration(user: users_models.User) -> bool:
    first_registration_datetime = subscription_api.get_first_registration_date(
        user, user.validatedBirthDate, users_models.EligibilityType.UNDERAGE
    )
    if first_registration_datetime is None:
        logger.error("No registration date for user to be recredited", extra={"user_id": user.id})
        return False

    return first_registration_datetime.date() < typing.cast(datetime.date, user.latest_birthday)


def can_be_recredited(user: users_models.User) -> bool:
    return (
        user.deposit_activation_date is not None
        and has_celebrated_birthday_since_registration(user)
        and not has_been_recredited(user)
    )


def has_been_recredited(user: users_models.User) -> bool:
    if user.deposit is None:
        return False
    if len(user.deposit.recredits) == 0:
        return False

    sorted_recredits = sorted(user.deposit.recredits, key=lambda recredit: recredit.dateCreated)
    return sorted_recredits[-1].recreditType == finance_conf.RECREDIT_TYPE_AGE_MAPPING[user.age]  # type: ignore [index]


def recredit_underage_users() -> None:
    sixteen_years_ago = datetime.datetime.utcnow() - relativedelta(years=16)
    eighteen_years_ago = datetime.datetime.utcnow() - relativedelta(years=18)

    user_ids = [
        result
        for result, in (
            users_models.User.query.filter(users_models.User.has_underage_beneficiary_role)
            .filter(users_models.User.validatedBirthDate > eighteen_years_ago)
            .filter(users_models.User.validatedBirthDate <= sixteen_years_ago)
            .with_entities(users_models.User.id)
            .all()
        )
    ]

    start_index = 0
    total_users_recredited = 0
    failed_users = []

    while start_index < len(user_ids):
        users = (
            users_models.User.query.filter(
                users_models.User.id.in_(user_ids[start_index : start_index + RECREDIT_BATCH_SIZE])
            )
            .options(joinedload(users_models.User.deposits).joinedload(finance_models.Deposit.recredits))
            .all()
        )

        users_to_recredit = [user for user in users if can_be_recredited(user)]
        users_and_recredit_amounts = []
        with transaction():
            for user in users_to_recredit:
                try:
                    recredit = finance_models.Recredit(
                        deposit=user.deposit,
                        amount=finance_conf.RECREDIT_TYPE_AMOUNT_MAPPING[
                            finance_conf.RECREDIT_TYPE_AGE_MAPPING[user.age]
                        ],
                        recreditType=finance_conf.RECREDIT_TYPE_AGE_MAPPING[user.age],
                    )
                    users_and_recredit_amounts.append((user, recredit.amount))
                    recredit.deposit.amount += recredit.amount
                    user.recreditAmountToShow = recredit.amount if recredit.amount > 0 else None

                    db.session.add(user)
                    db.session.add(recredit)
                    total_users_recredited += 1
                except Exception as e:  # pylint: disable=broad-except
                    failed_users.append(user.id)
                    logger.exception("Could not recredit user %s: %s", user.id, e)
                    continue

        logger.info("Recredited %s underage users deposits", len(users_to_recredit))

        for user, recredit_amount in users_and_recredit_amounts:
            external_attributes_api.update_external_user(user)
            domains_credit = users_api.get_domains_credit(user)
            if not transactional_mails.send_recredit_email_to_underage_beneficiary(
                user, recredit_amount, domains_credit
            ):
                logger.error("Failed to send recredit email to: %s", user.email)

        start_index += RECREDIT_BATCH_SIZE
    logger.info("Recredited %s users successfully", total_users_recredited)
    if failed_users:
        logger.error("Failed to recredit %s users: %s", len(failed_users), failed_users)
