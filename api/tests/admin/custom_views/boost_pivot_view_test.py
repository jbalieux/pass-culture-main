from unittest.mock import patch

import pcapi.core.offerers.factories as offerers_factories
import pcapi.core.providers.factories as providers_factories
import pcapi.core.providers.models as providers_models
import pcapi.core.providers.repository as providers_repository
from pcapi.core.users.factories import AdminFactory

from tests.conftest import TestClient
from tests.conftest import clean_database


class CreateBoostPivotTest:
    @clean_database
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_create_boost_information(self, _mocked_validate_csrf_token, app):
        AdminFactory(email="admin@example.fr")
        venue = offerers_factories.VenueFactory()

        data = {
            "venue_id": venue.id,
            "cinema_id": "12",
            "username": "username_test",
            "password": "password_test",
            "cinema_url": "https://test.com",
        }
        client = TestClient(app.test_client()).with_session_auth("admin@example.fr")
        response = client.post("/pc/back-office/boost/new", form=data)

        assert response.status_code == 302
        cinema_provider_pivot = providers_models.CinemaProviderPivot.query.filter(
            providers_models.CinemaProviderPivot.venueId == venue.id
        ).one()
        assert cinema_provider_pivot.idAtProvider == "12"
        boost_cinema_details = providers_models.BoostCinemaDetails.query.filter(
            providers_models.BoostCinemaDetails.cinemaProviderPivotId == cinema_provider_pivot.id
        ).one()
        assert boost_cinema_details.username == "username_test"
        assert boost_cinema_details.password == "password_test"
        assert boost_cinema_details.cinemaUrl == "https://test.com/"

    @clean_database
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_id_at_provider_unicity(self, _mocked_validate_csrf_token, app):
        AdminFactory(email="user@example.com")
        venue = offerers_factories.VenueFactory()
        boost_provider = providers_repository.get_provider_by_local_class("BoostStocks")
        _cinema_provider_pivot = providers_factories.CinemaProviderPivotFactory(
            venue=venue, provider=boost_provider, idAtProvider="cinema_test"
        )
        data = {
            "venue_id": venue.id,
            "account_id": "account_test",
            "cinema_id": "cinema_test",
            "api_token": "token_test",
        }
        client = TestClient(app.test_client()).with_session_auth("user@example.com")
        response = client.post("/pc/back-office/boost/new", form=data)

        assert response.status_code == 200
        assert "Cet identifiant cinéma existe déjà pour un autre lieu" in response.data.decode("utf8")
        assert providers_models.CinemaProviderPivot.query.count() == 1


class EditBoostPivotTest:
    @clean_database
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_update_boost_information(self, _mocked_validate_csrf_token, app):
        AdminFactory(email="admin@example.fr")
        boost_provider = providers_repository.get_provider_by_local_class("BoostStocks")
        venue = offerers_factories.VenueFactory()
        cinema_provider_pivot = providers_factories.CinemaProviderPivotFactory(
            venue=venue, provider=boost_provider, idAtProvider="12"
        )
        boost_cinema_details = providers_factories.BoostCinemaDetailsFactory(
            cinemaProviderPivot=cinema_provider_pivot,
            cinemaUrl="https://test.com/",
            username="username_test",
            password="password_test",
        )

        data = {
            "venue_id": venue.id,
            "cinema_id": "13",
            "username": "new_username",
            "password": "new_password",
            "cinema_url": "https://new-url.com/",
        }

        client = TestClient(app.test_client()).with_session_auth("admin@example.fr")
        response = client.post(f"/pc/back-office/boost/edit/?id={boost_cinema_details.id}", form=data)

        assert response.status_code == 302
        assert cinema_provider_pivot.idAtProvider == "13"
        assert boost_cinema_details.username == "new_username"
        assert boost_cinema_details.password == "new_password"
        assert boost_cinema_details.cinemaUrl == "https://new-url.com/"
        assert boost_cinema_details.token is None
        assert boost_cinema_details.tokenExpirationDate is None


class DeleteBoostPivotTest:
    @clean_database
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_delete_boost_information(self, _mocked_validate_csrf_token, app):
        AdminFactory(email="admin@example.fr")
        boost_provider = providers_repository.get_provider_by_local_class("BoostStocks")
        venue = offerers_factories.VenueFactory()
        cinema_provider_pivot = providers_factories.CinemaProviderPivotFactory(
            venue=venue, provider=boost_provider, idAtProvider="12"
        )
        boost_cinema_details = providers_factories.BoostCinemaDetailsFactory(
            cinemaProviderPivot=cinema_provider_pivot,
            cinemaUrl="https://test.com/",
            username="username_test",
            password="password_test",
        )

        client = TestClient(app.test_client()).with_session_auth("admin@example.fr")
        response = client.post("/pc/back-office/boost/delete", form={"id": boost_cinema_details.id})

        assert response.status_code == 302
        assert providers_models.BoostCinemaDetails.query.count() == 0
        assert providers_models.CinemaProviderPivot.query.count() == 0

    @clean_database
    @patch("wtforms.csrf.session.SessionCSRF.validate_csrf_token")
    def test_should_not_delete_boost_pivot_when_venue_provider_exist(self, _mocked_validate_csrf_token, app):
        AdminFactory(email="admin@example.fr")
        boost_provider = providers_repository.get_provider_by_local_class("BoostStocks")
        venue = offerers_factories.VenueFactory()
        cinema_provider_pivot = providers_factories.CinemaProviderPivotFactory(
            venue=venue, provider=boost_provider, idAtProvider="12"
        )
        boost_cinema_details = providers_factories.BoostCinemaDetailsFactory(
            cinemaProviderPivot=cinema_provider_pivot,
            cinemaUrl="https://test.com/",
            username="username_test",
            password="password_test",
        )
        providers_factories.VenueProviderFactory(venue=venue, provider=boost_provider)

        client = TestClient(app.test_client()).with_session_auth("admin@example.fr")
        response = client.post("/pc/back-office/boost/delete", form={"id": boost_cinema_details.id})

        assert response.status_code == 302
        assert providers_models.BoostCinemaDetails.query.count() == 1
        assert providers_models.CinemaProviderPivot.query.count() == 1
