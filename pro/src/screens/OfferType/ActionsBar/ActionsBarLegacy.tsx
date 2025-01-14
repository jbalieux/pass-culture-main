import React from 'react'

import FormLayout from 'components/FormLayout'
import { computeOffersUrl } from 'core/Offers/utils'
import { Button, ButtonLink } from 'ui-kit'
import { ButtonVariant } from 'ui-kit/Button/types'

interface IActionsBarLegacy {
  getNextPageHref: () => void
}

const ActionsBarLegacy = ({
  getNextPageHref,
}: IActionsBarLegacy): JSX.Element => {
  return (
    <FormLayout.Actions>
      <ButtonLink
        link={{ to: computeOffersUrl({}), isExternal: false }}
        variant={ButtonVariant.SECONDARY}
      >
        Annuler et quitter
      </ButtonLink>
      <Button onClick={getNextPageHref}>Étape suivante</Button>
    </FormLayout.Actions>
  )
}

export default ActionsBarLegacy
