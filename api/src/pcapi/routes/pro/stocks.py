import decimal
import logging

from flask_login import current_user
from flask_login import login_required

from pcapi.core.offerers import exceptions as offerers_exceptions
from pcapi.core.offerers.models import Venue
import pcapi.core.offerers.repository as offerers_repository
from pcapi.core.offers import exceptions as offers_exceptions
import pcapi.core.offers.api as offers_api
from pcapi.core.offers.models import Offer
from pcapi.core.offers.models import Stock
from pcapi.core.offers.repository import get_stocks_for_offer
from pcapi.models.api_errors import ApiErrors
from pcapi.repository import transaction
from pcapi.routes.apis import private_api
from pcapi.routes.serialization import stock_serialize
from pcapi.routes.serialization.stock_serialize import StockIdResponseModel
from pcapi.routes.serialization.stock_serialize import StockIdsResponseModel
from pcapi.routes.serialization.stock_serialize import StockResponseModel
from pcapi.routes.serialization.stock_serialize import StocksResponseModel
from pcapi.routes.serialization.stock_serialize import StocksUpsertBodyModel
from pcapi.serialization.decorator import spectree_serialize
from pcapi.utils.human_ids import dehumanize
from pcapi.utils.rest import check_user_has_access_to_offerer

from . import blueprint


logger = logging.getLogger(__name__)


@private_api.route("/offers/<offer_id>/stocks", methods=["GET"])
@login_required
@spectree_serialize(response_model=StocksResponseModel, api=blueprint.pro_private_schema)
def get_stocks(offer_id: str) -> StocksResponseModel:
    try:
        offerer = offerers_repository.get_by_offer_id(dehumanize(offer_id))  # type: ignore [arg-type]
    except offerers_exceptions.CannotFindOffererForOfferId:
        raise ApiErrors({"offerer": ["Aucune structure trouvée à partir de cette offre"]}, status_code=404)
    check_user_has_access_to_offerer(current_user, offerer.id)
    stocks = get_stocks_for_offer(dehumanize(offer_id))  # type: ignore [arg-type]
    return StocksResponseModel(
        stocks=[StockResponseModel.from_orm(stock) for stock in stocks],
    )


@private_api.route("/stocks/bulk", methods=["POST"])
@login_required
@spectree_serialize(on_success_status=201, response_model=StockIdsResponseModel, api=blueprint.pro_private_schema)
def upsert_stocks(body: StocksUpsertBodyModel) -> StockIdsResponseModel:
    try:
        offerer = offerers_repository.get_by_offer_id(body.offer_id)
    except offerers_exceptions.CannotFindOffererForOfferId:
        raise ApiErrors({"offerer": ["Aucune structure trouvée à partir de cette offre"]}, status_code=404)
    check_user_has_access_to_offerer(current_user, offerer.id)

    offer = Offer.query.get(body.offer_id)
    upserted_stocks = []
    edited_stocks_with_update_info: list[tuple[Stock, bool]] = []
    try:
        with transaction():
            for stock_payload in body.stocks:
                if isinstance(stock_payload, stock_serialize.StockEditionBodyModel):
                    edited_stock, is_beginning_updated = offers_api.edit_stock(
                        offer,
                        price=decimal.Decimal(stock_payload.price),
                        stock_id=stock_payload.id,
                        quantity=stock_payload.quantity,
                        beginning_datetime=stock_payload.beginning_datetime,
                        booking_limit_datetime=stock_payload.booking_limit_datetime,
                    )
                    upserted_stocks.append(edited_stock)
                    edited_stocks_with_update_info.append((edited_stock, is_beginning_updated))
                else:
                    created_stock = offers_api.create_stock(
                        offer,
                        price=decimal.Decimal(stock_payload.price),
                        activation_codes=stock_payload.activation_codes,
                        activation_codes_expiration_datetime=stock_payload.activation_codes_expiration_datetime,
                        quantity=stock_payload.quantity,
                        beginning_datetime=stock_payload.beginning_datetime,
                        booking_limit_datetime=stock_payload.booking_limit_datetime,
                    )
                    upserted_stocks.append(created_stock)

    except offers_exceptions.BookingLimitDatetimeTooLate:
        raise ApiErrors(
            {"stocks": ["La date limite de réservation ne peut être postérieure à la date de début de l'évènement"]},
            status_code=400,
        )
    offers_api.handle_stocks_edition(body.offer_id, edited_stocks_with_update_info)

    return StockIdsResponseModel(stockIds=[StockIdResponseModel.from_orm(stock) for stock in upserted_stocks])


@private_api.route("/stocks/<stock_id>", methods=["DELETE"])
@login_required
@spectree_serialize(response_model=StockIdResponseModel, api=blueprint.pro_private_schema)
def delete_stock(stock_id: str) -> StockIdResponseModel:
    # fmt: off
    stock = (
        Stock.queryNotSoftDeleted()
            .filter_by(id=dehumanize(stock_id))
            .join(Offer, Venue)
            .first_or_404()
    )
    # fmt: on

    offerer_id = stock.offer.venue.managingOffererId
    check_user_has_access_to_offerer(current_user, offerer_id)

    offers_api.delete_stock(stock)

    return StockIdResponseModel.from_orm(stock)
