from datetime import datetime
from unittest.mock import patch

import pcapi.core.users.factories as users_factories
from pcapi.models import Deposit
from pcapi.models.user_sql_entity import UserSQLEntity

from tests.conftest import TestClient
from tests.conftest import clean_database


class BeneficiaryUserViewTest:
    @clean_database
    @patch("pcapi.admin.custom_views.beneficiary_user_view.send_raw_email", return_value=True)
    def test_beneficiary_user_creation(self, mocked_send_raw_email, app):
        users_factories.UserFactory(email="user@example.com", isAdmin=True, isBeneficiary=False)

        data = dict(
            email="toto@email.fr",
            firstName="Serge",
            lastName="Lama",
            dateOfBirth="2002-07-13 10:05:00",
            departementCode="93",
            postalCode="93000",
            isBeneficiary="y",
        )

        client = TestClient(app.test_client()).with_auth("user@example.com")
        response = client.post("/pc/back-office/beneficiary_users/new", form=data)

        assert response.status_code == 302

        user_created = UserSQLEntity.query.filter_by(email="toto@email.fr").one()
        assert user_created.firstName == "Serge"
        assert user_created.lastName == "Lama"
        assert user_created.publicName == "Serge Lama"
        assert user_created.dateOfBirth == datetime(2002, 7, 13, 10, 5)
        assert user_created.departementCode == "93"
        assert user_created.postalCode == "93000"
        assert user_created.isBeneficiary is True
        assert len(user_created.deposits) == 1
        assert user_created.deposits[0].source == "pass-culture-admin"
        assert user_created.deposits[0].amount == 500

        mocked_send_raw_email.assert_called_with(
            data={
                "FromEmail": "support@example.com",
                "Mj-TemplateID": 994771,
                "Mj-TemplateLanguage": True,
                "To": "toto@email.fr",
                "Vars": {
                    "prenom_user": "Serge",
                    "token": user_created.resetPasswordToken,
                    "email": "toto%40email.fr",
                    "env": "-development",
                },
            }
        )

    @patch("pcapi.settings.IS_PROD", return_value=True)
    @patch("pcapi.settings.SUPER_ADMIN_EMAIL_ADDRESSES", return_value="")
    def test_beneficiary_user_creation_is_restricted_in_prod(
        self, is_prod_mock, super_admin_email_addresses, app, db_session
    ):
        users_factories.UserFactory(email="user@example.com", isAdmin=True, isBeneficiary=False)

        data = dict(
            email="toto@email.fr",
            firstName="Serge",
            lastName="Lama",
            dateOfBirth="2002-07-13 10:05:00",
            departementCode="93",
            postalCode="93000",
            isBeneficiary="y",
        )

        client = TestClient(app.test_client()).with_auth("user@example.com")
        response = client.post("/pc/back-office/beneficiary_users/new", form=data)

        assert response.status_code == 302

        filtered_users = UserSQLEntity.query.filter_by(email="toto@email.fr").all()
        deposits = Deposit.query.all()
        assert len(filtered_users) == 0
        assert len(deposits) == 0

    @clean_database
    # FIXME (dbaty, 2020-12-16): I could not find a quick way to
    # generate a valid CSRF token in tests. This should be fixed.
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_suspend_beneficiary(self, mocked_validate_csrf_token, app):
        admin = users_factories.UserFactory(email="admin15@example.com", isAdmin=True, isBeneficiary=False)
        beneficiary = users_factories.UserFactory(email="user15@example.com")

        client = TestClient(app.test_client()).with_auth(admin.email)
        url = f"/pc/back-office/beneficiary_users/suspend?user_id={beneficiary.id}"
        data = {
            "reason": "fraud",
            "csrf_token": "token",
        }
        response = client.post(url, form=data)

        assert response.status_code == 302
        assert not beneficiary.isActive

    @clean_database
    # FIXME (dbaty, 2020-12-16): I could not find a quick way to
    # generate a valid CSRF token in tests. This should be fixed.
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_unsuspend_beneficiary(self, mocked_validate_csrf_token, app):
        admin = users_factories.UserFactory(email="admin15@example.com", isAdmin=True, isBeneficiary=False)
        beneficiary = users_factories.UserFactory(email="user15@example.com", isActive=False)

        client = TestClient(app.test_client()).with_auth(admin.email)
        url = f"/pc/back-office/beneficiary_users/unsuspend?user_id={beneficiary.id}"
        data = {
            "reason": "fraud",
            "csrf_token": "token",
        }
        response = client.post(url, form=data)

        assert response.status_code == 302
        assert beneficiary.isActive
