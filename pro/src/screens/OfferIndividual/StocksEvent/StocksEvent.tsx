import { FormikProvider, useFormik } from 'formik'
import React, { useState, useEffect } from 'react'

import { api } from 'apiClient/api'
import FormLayout from 'components/FormLayout'
import { OFFER_WIZARD_STEP_IDS } from 'components/OfferIndividualStepper'
import { RouteLeavingGuardOfferIndividual } from 'components/RouteLeavingGuardOfferIndividual'
import {
  getValidationSchema,
  buildInitialValues,
  IStockEventFormValues,
} from 'components/StockEventForm'
import { useOfferIndividualContext } from 'context/OfferIndividualContext'
import {
  Events,
  OFFER_FORM_NAVIGATION_MEDIUM,
  OFFER_FORM_NAVIGATION_OUT,
} from 'core/FirebaseEvents/constants'
import { OFFER_WIZARD_MODE } from 'core/Offers'
import { getOfferIndividualAdapter } from 'core/Offers/adapters'
import { IOfferIndividual } from 'core/Offers/types'
import { getOfferIndividualUrl } from 'core/Offers/utils/getOfferIndividualUrl'
import { useNavigate, useOfferWizardMode } from 'hooks'
import useAnalytics from 'hooks/useAnalytics'
import { useModal } from 'hooks/useModal'
import useNotification from 'hooks/useNotification'
import { getToday } from 'utils/date'
import { getLocalDepartementDateTimeFromUtc } from 'utils/timezone'

import { ActionBar } from '../ActionBar'
import DialogStocksEventEditConfirm from '../DialogStocksEventEditConfirm/DialogStocksEventEditConfirm'
import { useNotifyFormError } from '../hooks/useNotifyFormErrors'
import { SynchronizedProviderInformation } from '../SynchronisedProviderInfos'
import { getSuccessMessage } from '../utils'
import { logTo } from '../utils/logTo'

import { upsertStocksEventAdapter } from './adapters'
import { StockFormList } from './StockFormList'

export interface IStocksEventProps {
  offer: IOfferIndividual
}

const StocksEvent = ({ offer }: IStocksEventProps): JSX.Element => {
  const mode = useOfferWizardMode()
  const [afterSubmitUrl, setAfterSubmitUrl] = useState<string>(
    getOfferIndividualUrl({
      offerId: offer.id,
      step: OFFER_WIZARD_STEP_IDS.SUMMARY,
      mode,
    })
  )
  const [
    isSubmittingFromRouteLeavingGuard,
    setIsSubmittingFromRouteLeavingGuard,
  ] = useState<boolean>(false)
  const [isClickingFromActionBar, setIsClickingFromActionBar] =
    useState<boolean>(false)
  const [isSubmittingDraft, setIsSubmittingDraft] = useState<boolean>(false)
  const { logEvent } = useAnalytics()
  const navigate = useNavigate()
  const notify = useNotification()
  const { setOffer, shouldTrack, setShouldTrack } = useOfferIndividualContext()
  const providerName = offer?.lastProviderName
  const { visible, showModal, hideModal } = useModal()

  const onSubmit = async (formValues: { stocks: IStockEventFormValues[] }) => {
    const { isOk, payload } = await upsertStocksEventAdapter({
      offerId: offer.id,
      formValues: formValues.stocks,
      departementCode: offer.venue.departmentCode,
    })

    /* istanbul ignore next: DEBT, TO FIX */
    if (isOk) {
      notify.success(getSuccessMessage(mode))
      const response = await getOfferIndividualAdapter(offer.id)
      if (response.isOk) {
        setOffer && setOffer(response.payload)
      }
      if (!isSubmittingFromRouteLeavingGuard) {
        navigate(afterSubmitUrl)
        logEvent?.(Events.CLICKED_OFFER_FORM_NAVIGATION, {
          from: OFFER_WIZARD_STEP_IDS.STOCKS,
          to: isSubmittingDraft
            ? OFFER_WIZARD_STEP_IDS.STOCKS
            : OFFER_WIZARD_STEP_IDS.SUMMARY,
          used: isSubmittingDraft
            ? OFFER_FORM_NAVIGATION_MEDIUM.DRAFT_BUTTONS
            : OFFER_FORM_NAVIGATION_MEDIUM.STICKY_BUTTONS,
          isEdition: mode !== OFFER_WIZARD_MODE.CREATION,
          isDraft: mode !== OFFER_WIZARD_MODE.EDITION,
          offerId: offer.id,
        })
      }
    } else {
      /* istanbul ignore next: DEBT, TO FIX */
      formik.setErrors({ stocks: payload.errors })
    }
    setIsClickingFromActionBar(false)
  }

  const onDeleteStock = async (stockValues: IStockEventFormValues) => {
    const { isDeletable, stockId } = stockValues
    stockId &&
      isDeletable &&
      api
        .deleteStock(stockId)
        .then(() => {
          notify.success('Le stock a été supprimé.')
        })
        .catch(() =>
          notify.error(
            'Une erreur est survenue lors de la suppression du stock.'
          )
        )
  }

  const today = getLocalDepartementDateTimeFromUtc(
    getToday(),
    offer.venue.departmentCode
  )
  const initialValues = buildInitialValues({
    departmentCode: offer.venue.departmentCode,
    offerStocks: offer.stocks,
    today,
    lastProviderName: offer.lastProviderName,
    offerStatus: offer.status,
  })
  const formik = useFormik<{ stocks: IStockEventFormValues[] }>({
    initialValues,
    onSubmit,
    // enableReinitialize is needed to reset dirty after submit (and not block after saving a draft)
    // mostly needed to reinitialize the form after initialValue update and so not submiting duplicated stocks
    // when clicking multiple times on "Save draft"
    validationSchema: getValidationSchema(),
    enableReinitialize: true,
  })
  useNotifyFormError({
    isSubmitting: formik.isSubmitting,
    errors: formik.errors,
  })

  useEffect(() => {
    // when form is dirty it's tracked by RouteLeavingGuard
    setShouldTrack(!formik.dirty)
  }, [formik.dirty])

  const handleNextStep =
    ({ saveDraft = false } = {}) =>
    () => {
      // tested but coverage don't see it.
      /* istanbul ignore next */
      setIsSubmittingDraft(saveDraft)
      setIsClickingFromActionBar(true)
      setAfterSubmitUrl(
        getOfferIndividualUrl({
          offerId: offer.id,
          step: saveDraft
            ? OFFER_WIZARD_STEP_IDS.STOCKS
            : OFFER_WIZARD_STEP_IDS.SUMMARY,
          mode,
        })
      )
      if (mode !== OFFER_WIZARD_MODE.CREATION) {
        const changesOnStockWithBookings = formik.values.stocks.some(
          (stock, index) => {
            if (
              !stock.bookingsQuantity ||
              parseInt(stock.bookingsQuantity, 10) === 0 ||
              formik.touched.stocks === undefined ||
              formik.touched.stocks[index] === undefined
            ) {
              return false
            }
            const stockTouched = formik.touched.stocks[index]
            if (stockTouched === undefined) {
              return false
            }
            const fieldsWithWarning: (keyof IStockEventFormValues)[] = [
              'price',
              'beginningDate',
              'beginningTime',
            ] as (keyof IStockEventFormValues)[]

            return fieldsWithWarning.some(
              (fieldName: keyof IStockEventFormValues) =>
                stockTouched[fieldName] === true
            )
          }
        )
        if (!visible && changesOnStockWithBookings) {
          showModal()
          return
        } else {
          hideModal()
        }
      }

      const hasSavedStock = formik.values.stocks.some(
        stock => stock.stockId !== undefined
      )
      if (hasSavedStock && Object.keys(formik.touched).length === 0) {
        setIsClickingFromActionBar(false)
        notify.success(getSuccessMessage(mode))
        if (!saveDraft) {
          navigate(
            getOfferIndividualUrl({
              offerId: offer.id,
              step: saveDraft
                ? OFFER_WIZARD_STEP_IDS.STOCKS
                : OFFER_WIZARD_STEP_IDS.SUMMARY,
              mode,
            })
          )
        }
      } else {
        formik.handleSubmit()
      }
    }

  const handlePreviousStep = () => {
    if (!formik.dirty) {
      logEvent?.(Events.CLICKED_OFFER_FORM_NAVIGATION, {
        from: OFFER_WIZARD_STEP_IDS.STOCKS,
        to: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
        used: OFFER_FORM_NAVIGATION_MEDIUM.STICKY_BUTTONS,
        isEdition: mode !== OFFER_WIZARD_MODE.CREATION,
        isDraft: mode !== OFFER_WIZARD_MODE.EDITION,
        offerId: offer.id,
      })
    }
    /* istanbul ignore next: DEBT, TO FIX */
    navigate(
      getOfferIndividualUrl({
        offerId: offer.id,
        step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
        mode,
      })
    )
  }

  return (
    <FormikProvider value={formik}>
      {providerName && (
        <SynchronizedProviderInformation providerName={providerName} />
      )}
      {visible && (
        <DialogStocksEventEditConfirm
          onConfirm={handleNextStep()}
          onCancel={hideModal}
        />
      )}
      <FormLayout>
        <FormLayout.Section
          title="Stock & Prix"
          description={
            'Les utilisateurs ont un délai de 48h pour annuler leur réservation mais ne peuvent pas le faire moins de 48h avant le début de l’événement. Si la date limite de réservation n’est pas encore passée, la place est alors automatiquement remise en vente.'
          }
        >
          <form onSubmit={formik.handleSubmit}>
            <StockFormList offer={offer} onDeleteStock={onDeleteStock} />
            <ActionBar
              isDisabled={formik.isSubmitting}
              onClickNext={handleNextStep()}
              onClickPrevious={handlePreviousStep}
              onClickSaveDraft={handleNextStep({ saveDraft: true })}
              step={OFFER_WIZARD_STEP_IDS.STOCKS}
              offerId={offer.id}
              shouldTrack={shouldTrack}
            />
          </form>
        </FormLayout.Section>
      </FormLayout>

      <RouteLeavingGuardOfferIndividual
        when={formik.dirty && !isClickingFromActionBar}
        saveForm={formik.submitForm}
        setIsSubmittingFromRouteLeavingGuard={
          setIsSubmittingFromRouteLeavingGuard
        }
        mode={mode}
        isFormValid={formik.isValid}
        tracking={nextLocation =>
          logEvent?.(Events.CLICKED_OFFER_FORM_NAVIGATION, {
            from: OFFER_WIZARD_STEP_IDS.STOCKS,
            to: logTo(nextLocation),
            used: OFFER_FORM_NAVIGATION_OUT.ROUTE_LEAVING_GUARD,
            isEdition: mode !== OFFER_WIZARD_MODE.CREATION,
            isDraft: mode !== OFFER_WIZARD_MODE.EDITION,
            offerId: offer?.id,
          })
        }
        hasOfferBeenCreated
      />
    </FormikProvider>
  )
}

export default StocksEvent
