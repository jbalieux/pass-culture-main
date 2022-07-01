import logging
import math

from flask_login import login_required

from pcapi.core.educational import adage_backends as adage_client
from pcapi.core.educational import api
from pcapi.routes.apis import private_api
from pcapi.routes.pro import blueprint
from pcapi.routes.serialization import educational_institutions
from pcapi.routes.serialization import venues_serialize
from pcapi.serialization.decorator import spectree_serialize


logger = logging.getLogger(__name__)


@private_api.route("/educational_institutions", methods=["GET"])
@login_required
@spectree_serialize(
    response_model=educational_institutions.EducationalInstitutionsResponseModel,
    on_success_status=200,
    on_error_statuses=[401],
    api=blueprint.pro_private_schema,
)
def get_educational_institutions(
    query: educational_institutions.EducationalInstitutionsQueryModel,
) -> educational_institutions.EducationalInstitutionsResponseModel:

    institutions, total = api.get_all_educational_institutions(
        page=query.page,
        per_page_limit=query.per_page_limit,
    )
    return educational_institutions.EducationalInstitutionsResponseModel.construct(
        educationalInstitutions=[
            educational_institutions.EducationalInstitutionResponseModel.construct(
                id=institution.id,
                name=institution.name,
                postalCode=institution.postalCode,
                city=institution.city,
            )
            for institution in institutions
        ],
        page=query.page,
        pages=max(int(math.ceil(total / query.per_page_limit)), 1),
        total=total,
    )


@private_api.route("/cultural-partners", methods=["GET"])
@login_required
@spectree_serialize(
    response_model=venues_serialize.AdageCulturalPartnersResponseModel,
    on_success_status=200,
    on_error_statuses=[401],
    api=blueprint.pro_private_schema,
)
def get_educational_partners() -> venues_serialize.AdageCulturalPartnersResponseModel:
    data = adage_client.get_cultural_partners()
    return venues_serialize.AdageCulturalPartnersResponseModel.from_orm(data)