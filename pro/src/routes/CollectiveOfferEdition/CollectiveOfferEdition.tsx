import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import useNotification from 'components/hooks/useNotification'
import Spinner from 'components/layout/Spinner'
import { NOTIFICATION_LONG_SHOW_DURATION } from 'core/Notification/constants'
import {
  DEFAULT_EAC_FORM_VALUES,
  IOfferEducationalFormValues,
  Mode,
  cancelCollectiveBookingAdapter,
  extractOfferIdAndOfferTypeFromRouteParams,
  patchIsCollectiveOfferActiveAdapter,
  patchIsTemplateOfferActiveAdapter,
  setInitialFormValues,
  CollectiveOffer,
  CollectiveOfferTemplate,
} from 'core/OfferEducational'
import getCollectiveOfferFormDataApdater from 'core/OfferEducational/adapters/getCollectiveOfferFormDataAdapter'
import { computeURLCollectiveOfferId } from 'core/OfferEducational/utils/computeURLCollectiveOfferId'
import OfferEducationalScreen from 'screens/OfferEducational'
import { IOfferEducationalProps } from 'screens/OfferEducational/OfferEducational'

import patchCollectiveOfferAdapter from './adapters/patchCollectiveOfferAdapter'
import { patchCollectiveOfferTemplateAdapter } from './adapters/patchCollectiveOfferTemplateAdapter'

type AsyncScreenProps = Pick<
  IOfferEducationalProps,
  'categories' | 'userOfferers' | 'domainsOptions'
>

const CollectiveOfferEdition = ({
  offer,
  reloadCollectiveOffer,
}: {
  offer: CollectiveOffer | CollectiveOfferTemplate
  reloadCollectiveOffer: () => void
}): JSX.Element => {
  const { offerId: offerIdFromParams } = useParams<{ offerId: string }>()
  const { offerId, isShowcase } =
    extractOfferIdAndOfferTypeFromRouteParams(offerIdFromParams)
  const history = useHistory()

  const [isReady, setIsReady] = useState<boolean>(false)
  const [screenProps, setScreenProps] = useState<AsyncScreenProps | null>(null)
  const [initialValues, setInitialValues] =
    useState<IOfferEducationalFormValues>(DEFAULT_EAC_FORM_VALUES)

  const notify = useNotification()

  const editOffer = useCallback(
    async (offerFormValues: IOfferEducationalFormValues) => {
      if (offer) {
        const patchAdapter = isShowcase
          ? patchCollectiveOfferTemplateAdapter
          : patchCollectiveOfferAdapter
        const offerResponse = await patchAdapter({
          offerId,
          offer: offerFormValues,
          initialValues,
        })

        if (!offerResponse.isOk) {
          return notify.error(offerResponse.message)
        }

        notify.success(offerResponse.message)
        history.push(
          `/offre/${computeURLCollectiveOfferId(
            offer.id,
            offer.isTemplate
          )}/collectif/recapitulatif`
        )
      }
    },
    [offer]
  )

  const setIsOfferActive = async (isActive: boolean) => {
    const patchAdapter = isShowcase
      ? patchIsTemplateOfferActiveAdapter
      : patchIsCollectiveOfferActiveAdapter
    const { isOk, message } = await patchAdapter({
      isActive,
      offerId,
    })

    if (!isOk) {
      return notify.error(message)
    }

    notify.success(message)
    reloadCollectiveOffer()
  }

  const cancelActiveBookings = async () => {
    const { isOk, message } = await cancelCollectiveBookingAdapter({
      offerId,
    })

    if (!isOk) {
      return notify.error(message, NOTIFICATION_LONG_SHOW_DURATION)
    }

    notify.success(message, NOTIFICATION_LONG_SHOW_DURATION)
    reloadCollectiveOffer()
  }

  const loadData = useCallback(
    async (offerResponse: CollectiveOffer | CollectiveOfferTemplate) => {
      const offererId = offerResponse.venue.managingOffererId

      const result = await getCollectiveOfferFormDataApdater({
        offererId,
        offer: offerResponse,
      })

      if (!result.isOk) {
        notify.error(result.message)
      }

      const { categories, offerers, domains, initialValues } = result.payload

      setScreenProps({
        categories: categories,
        userOfferers: offerers,
        domainsOptions: domains,
      })

      setInitialValues(values =>
        setInitialFormValues(
          {
            ...values,
            ...initialValues,
          },
          offerers,
          offerers[0].id,
          offerResponse.venueId
        )
      )

      setIsReady(true)
    },
    [notify]
  )

  useEffect(() => {
    if (!isReady) {
      loadData(offer)
    }
  }, [isReady, offerId, loadData, history, isShowcase])

  if (!isReady || !screenProps || !offer) {
    return <Spinner />
  }

  return (
    <OfferEducationalScreen
      {...screenProps}
      cancelActiveBookings={cancelActiveBookings}
      initialValues={initialValues}
      isOfferActive={offer?.isActive}
      isOfferBooked={
        offer?.isTemplate ? false : offer?.collectiveStock?.isBooked
      }
      isOfferCancellable={offer && offer.isCancellable}
      mode={offer?.isEditable ? Mode.EDITION : Mode.READ_ONLY}
      onSubmit={editOffer}
      setIsOfferActive={setIsOfferActive}
    />
  )
}

export default CollectiveOfferEdition