from pcapi.core.categories import categories
from pcapi.routes.pro import blueprint
from pcapi.routes.serialization import public_api_collective_offers_serialize
from pcapi.serialization.decorator import spectree_serialize
from pcapi.validation.routes.users_authentifications import api_key_required


@blueprint.pro_public_api_v2.route("/collective/categories", methods=["GET"])
@api_key_required
@spectree_serialize(
    on_success_status=200,
    on_error_statuses=[401],
    response_model=public_api_collective_offers_serialize.CollectiveOffersListCategoriesResponseModel,
    api=blueprint.pro_public_schema_v2,
)
def list_categories() -> public_api_collective_offers_serialize.CollectiveOffersListCategoriesResponseModel:
    # in French, to be used by Swagger for the API documentation
    """Récupération de la liste des catégories d'offres proposées."""
    return public_api_collective_offers_serialize.CollectiveOffersListCategoriesResponseModel(
        __root__=[
            public_api_collective_offers_serialize.CollectiveOffersCategoryResponseModel(
                id=category.id, name=category.pro_label
            )
            for category in categories.ALL_CATEGORIES
            if category.is_selectable
        ]
    )