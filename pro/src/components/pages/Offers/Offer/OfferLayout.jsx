import Breadcrumb, { OfferBreadcrumbStep } from 'new_components/OfferBreadcrumb'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom'

import Confirmation from 'components/pages/Offers/Offer/Confirmation/Confirmation'
import OfferDetails from './OfferDetails'
import { OfferHeader } from 'components/pages/Offers/Offer/OfferStatus/OfferHeader'
import { OfferIndividualSummary as OfferSummaryRoute } from 'routes/OfferIndividualSummary'
import RouteLeavingGuardOfferCreation from 'new_components/RouteLeavingGuardOfferCreation'
import StocksContainer from 'components/pages/Offers/Offer/Stocks/StocksContainer'
import Titles from 'components/layout/Titles/Titles'
import { apiV1 } from 'api/api'

const mapPathToStep = {
  creation: OfferBreadcrumbStep.DETAILS,
  edition: OfferBreadcrumbStep.DETAILS,
  stocks: OfferBreadcrumbStep.STOCKS,
  recapitulatif: OfferBreadcrumbStep.SUMMARY,
  confirmation: OfferBreadcrumbStep.CONFIRMATION,
}

const getActiveStepFromLocation = location => {
  let urlMatch = location.pathname.match(/[a-z]+$/)
  let stepName = urlMatch && urlMatch[0]
  // handle creation urls since the above code only works for edition urls
  if (stepName === 'individuel') {
    urlMatch = location.pathname.match(/[a-z]+\/individuel$/)
    stepName = urlMatch && urlMatch[0].split('/individuel')[0]
  }

  return stepName ? mapPathToStep[stepName] : null
}

const OfferLayout = () => {
  const history = useHistory()
  const location = useLocation()
  const match = useRouteMatch()
  const isCreatingOffer = location.pathname.includes('creation')
  const [offer, setOffer] = useState(null)

  const loadOffer = async offerId => {
    try {
      const existingOffer = await apiV1.getOffersGetOffer(offerId)
      setOffer(existingOffer)
    } catch {
      history.push('/404')
    }
  }
  const activeStep = getActiveStepFromLocation(location)

  const reloadOffer = useCallback(
    async () => (offer.id ? await loadOffer(offer.id) : false),
    [offer?.id]
  )

  useEffect(() => {
    async function loadOfferFromQueryParam() {
      await loadOffer(match.params.offerId)
    }
    match.params.offerId && loadOfferFromQueryParam()
  }, [match.params.offerId])

  let pageTitle = 'Nouvelle offre'

  if (match.params.offerId && !offer) {
    return null
  }

  if (!isCreatingOffer) {
    pageTitle = 'Éditer une offre'
  }

  const offerHeader =
    !isCreatingOffer && !location.pathname.includes('/confirmation') ? (
      <OfferHeader offer={offer} reloadOffer={reloadOffer} />
    ) : null

  if (offer?.isEducational) {
    history.push(
      `/offre/${match.params.offerId}/collectif/${
        activeStep === 'stocks' ? 'stocks/edition' : 'edition'
      }`
    )
  }

  return (
    <div className="offer-page">
      <Titles action={offerHeader} title={pageTitle} />

      <Breadcrumb
        activeStep={activeStep}
        isCreatingOffer={isCreatingOffer}
        isOfferEducational={offer?.isEducational}
        offerId={offer?.id}
      />

      <div className="offer-content">
        <Switch>
          <Route exact path="/offre/creation/individuel">
            {/* FIXME (cgaunet, 2022-01-31) This is a quick win to fix a flaky E2E test */}
            {/* There is a concurrency run between the RouteLeavingGuardOfferCreation and the reloadOffer call */}
            {/* in OfferDetails as the offer is loaded in the stock edition page */}
            <OfferDetails offer={offer} reloadOffer={reloadOffer} />
          </Route>
          <Route exact path={`${match.url}/edition`}>
            <OfferDetails offer={offer} reloadOffer={reloadOffer} />
          </Route>
          <Route
            exact
            path={[`${match.url}/stocks`, `${match.url}/creation/stocks`]}
          >
            <StocksContainer
              location={location}
              offer={offer}
              reloadOffer={reloadOffer}
            />
          </Route>
          <Route
            exact
            path={[
              `${match.path}/recapitulatif`,
              `${match.path}/creation/recapitulatif`,
            ]}
          >
            <OfferSummaryRoute formOfferV2={true} />
          </Route>
          <Route exact path={`${match.url}/creation/confirmation`}>
            {() => <Confirmation offer={offer} setOffer={setOffer} />}
          </Route>
        </Switch>
      </div>
      <RouteLeavingGuardOfferCreation when={isCreatingOffer} />
    </div>
  )
}

export default OfferLayout
