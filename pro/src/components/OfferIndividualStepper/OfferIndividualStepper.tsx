import React from 'react'
import { generatePath } from 'react-router'

import Breadcrumb, {
  BreadcrumbStyle,
  IStepPattern,
  Step,
} from 'components/Breadcrumb'
import { useOfferIndividualContext } from 'context/OfferIndividualContext'
import {
  Events,
  OFFER_FORM_NAVIGATION_MEDIUM,
} from 'core/FirebaseEvents/constants'
import { OFFER_WIZARD_MODE } from 'core/Offers'
import { getOfferIndividualPath } from 'core/Offers/utils/getOfferIndividualUrl'
import { useOfferWizardMode } from 'hooks'
import useAnalytics from 'hooks/useAnalytics'

import { OFFER_WIZARD_STEP_IDS } from './constants'
import { useActiveStep } from './hooks'
import styles from './OfferIndividualStepper.module.scss'

interface IOfferIndividualStepper {
  shouldTrack?: boolean
}

const OfferIndividualStepper = ({
  shouldTrack = true,
}: IOfferIndividualStepper) => {
  const { offer } = useOfferIndividualContext()
  const activeStep = useActiveStep()
  const { logEvent } = useAnalytics()
  const mode = useOfferWizardMode()
  const hasOffer = offer !== null
  const hasStock = offer !== null && offer.stocks.length > 0
  const stepPatternList: IStepPattern[] = [
    {
      id: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
      label: 'Détails de l’offre',
      path: {
        [OFFER_WIZARD_MODE.CREATION]: getOfferIndividualPath({
          step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
          mode: OFFER_WIZARD_MODE.CREATION,
        }),
        [OFFER_WIZARD_MODE.DRAFT]: getOfferIndividualPath({
          step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
          mode: OFFER_WIZARD_MODE.DRAFT,
        }),
        [OFFER_WIZARD_MODE.EDITION]: getOfferIndividualPath({
          step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
          mode: OFFER_WIZARD_MODE.EDITION,
        }),
      }[mode],
      isActive: true,
    },
    {
      id: OFFER_WIZARD_STEP_IDS.STOCKS,
      label: 'Stock & Prix',
      path: {
        [OFFER_WIZARD_MODE.CREATION]: getOfferIndividualPath({
          step: OFFER_WIZARD_STEP_IDS.STOCKS,
          mode: OFFER_WIZARD_MODE.CREATION,
        }),
        [OFFER_WIZARD_MODE.DRAFT]: getOfferIndividualPath({
          step: OFFER_WIZARD_STEP_IDS.STOCKS,
          mode: OFFER_WIZARD_MODE.DRAFT,
        }),
        [OFFER_WIZARD_MODE.EDITION]: getOfferIndividualPath({
          step: OFFER_WIZARD_STEP_IDS.STOCKS,
          mode: OFFER_WIZARD_MODE.EDITION,
        }),
      }[mode],
      isActive: hasOffer,
    },
  ]

  if (mode !== OFFER_WIZARD_MODE.EDITION) {
    stepPatternList.push(
      {
        id: OFFER_WIZARD_STEP_IDS.SUMMARY,
        label: 'Récapitulatif',
        path: {
          [OFFER_WIZARD_MODE.CREATION]: getOfferIndividualPath({
            step: OFFER_WIZARD_STEP_IDS.SUMMARY,
            mode: OFFER_WIZARD_MODE.CREATION,
          }),
          [OFFER_WIZARD_MODE.DRAFT]: getOfferIndividualPath({
            step: OFFER_WIZARD_STEP_IDS.SUMMARY,
            mode: OFFER_WIZARD_MODE.DRAFT,
          }),
        }[mode],
        isActive: hasStock,
      },
      {
        id: OFFER_WIZARD_STEP_IDS.CONFIRMATION,
        label: 'Confirmation',
        isActive: false,
      }
    )
  }

  const stepList = stepPatternList.map((stepPattern: IStepPattern): Step => {
    const step: Step = {
      id: stepPattern.id,
      label: stepPattern.label,
      onClick: () => {
        shouldTrack &&
          logEvent?.(Events.CLICKED_OFFER_FORM_NAVIGATION, {
            from: activeStep,
            to: step.id,
            used: OFFER_FORM_NAVIGATION_MEDIUM.BREADCRUMB,
            isEdition: mode !== OFFER_WIZARD_MODE.CREATION,
            isDraft: mode !== OFFER_WIZARD_MODE.EDITION,
            offerId: offer?.id,
          })
      },
    }
    if (stepPattern.isActive && stepPattern.path && offer) {
      step.url = generatePath(stepPattern.path, { offerId: offer.id })
    }
    return step
  })

  return (
    <Breadcrumb
      activeStep={activeStep}
      steps={stepList}
      styleType={
        mode !== OFFER_WIZARD_MODE.EDITION
          ? BreadcrumbStyle.STEPPER
          : BreadcrumbStyle.TAB
      }
      className={
        mode !== OFFER_WIZARD_MODE.EDITION ? styles['stepper-creation'] : ''
      }
    />
  )
}

export default OfferIndividualStepper
