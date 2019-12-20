import React from 'react'
import { Redirect } from 'react-router-dom'

import ActivationContainer from '../pages/activation/ActivationContainer'
import BetaPageContainer from '../pages/beta-page/BetaPageContainer'
import MyBookingsContainer from '../pages/my-bookings/MyBookingsContainer'
import DiscoveryContainer from '../pages/discovery/DiscoveryContainer'
import MyFavoritesContainer from '../pages/my-favorites/MyFavoritesContainer'
import ForgotPassword from '../pages/forgot-password/ForgotPassword'
import ProfileContainer from '../pages/profile/ProfileContainer'
import TypeFormContainer from '../pages/typeform/TypeformContainer'
import SearchContainer from '../pages/search/SearchContainer'
import SignInContainer from '../pages/signin/SignInContainer'
import SignupContainer from '../pages/signup/SignupContainer'
import { WEBAPP_CONTACT_EXTERNAL_PAGE } from '../../utils/config'
import SearchAlgoliaContainer from '../pages/search-algolia/SearchAlgoliaContainer'

function redirectToBeta() {
  return <Redirect to="/beta" />
}

const routes = [
  {
    path: '/',
    render: redirectToBeta,
  },
  {
    component: BetaPageContainer,
    path: '/beta',
    title: 'Bienvenue dans l’avant-première du pass Culture',
  },
  {
    component: ActivationContainer,
    path: '/activation/:token?',
    title: 'Activation',
  },
  {
    component: SignInContainer,
    path: '/connexion',
    title: 'Connexion',
  },
  {
    component: SignupContainer,
    featureName: 'WEBAPP_SIGNUP',
    path: '/inscription',
    title: 'Inscription',
  },
  {
    component: ForgotPassword,
    path: '/mot-de-passe-perdu/:view?',
    title: 'Mot de passe perdu',
  },
  {
    component: TypeFormContainer,
    path: '/typeform',
    title: 'Questionnaire',
  },
  /* ---------------------------------------------------
   *
   * MENU ITEMS
   * NOTE les elements ci-dessous sont les elements du main menu
   * Car ils contiennent une propriété `icon`
   *
   ---------------------------------------------------  */
  {
    component: DiscoveryContainer,
    icon: 'ico-offres',
    path:
      '/decouverte/:offerId?/:mediationId?/:details(details|transition)?/:booking(reservation)?/:bookingId?/:cancellation(annulation)?/:confirmation(confirmation)?',
    title: 'Les offres',
  },
  {
    component: SearchContainer,
    icon: 'ico-search',
    path:
      '/recherche/:results(resultats)?/:category?/:details(details|transition)?/:offerId?/:mediationId?/:booking(reservation)?/:bookingId?/:cancellation(annulation)?/:confirmation(confirmation)?',
    title: 'Recherche',
  },
  {
    component: SearchAlgoliaContainer,
    icon: 'search-w',
    path:
      '/recherche-algolia/:details(details|transition)?/:offerId?/:mediationId?/:booking(reservation)?/:bookingId?/:cancellation(annulation)?/:confirmation(confirmation)?',
    title: 'Recherche algolia',
  },
  {
    component: MyBookingsContainer,
    icon: 'ico-calendar-white',
    path:
      '/reservations/:details(details|transition)?/:bookingId?/:booking(reservation)?/:cancellation(annulation)?/:confirmation(confirmation)?/:qrcode(qrcode)?',
    title: 'Mes réservations',
  },
  {
    component: MyFavoritesContainer,
    icon: 'ico-like-empty',
    path:
      '/favoris/:details(details|transition)?/:offerId?/:mediationId?/:booking(reservation)?/:bookingId?/:cancellation(annulation)?/:confirmation(confirmation)?',
    title: 'Mes favoris',
  },
  {
    component: ProfileContainer,
    icon: 'ico-user',
    path: '/profil/:view?/:status?',
    title: 'Mon compte',
  },
  {
    href: WEBAPP_CONTACT_EXTERNAL_PAGE,
    icon: 'ico-help',
    target: '_blank',
    title: 'Aide',
  },
  {
    href:
      'https://pass-culture.gitbook.io/documents/textes-normatifs/mentions-legales-et-conditions-generales-dutilisation-de-lapplication-pass-culture',
    icon: 'ico-txt',
    target: '_blank',
    title: 'Mentions légales',
  },
]

export default routes
