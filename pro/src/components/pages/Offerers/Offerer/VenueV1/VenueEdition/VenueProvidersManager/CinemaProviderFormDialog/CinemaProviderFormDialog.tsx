import './CinemaProviderFormDialog.scss'

import { CinemaProviderForm } from '../CinemaProviderForm/CinemaProviderForm'
import DialogBox from 'new_components/DialogBox'
import React from 'react'

interface ICinemaProviderFormDialogProps {
  onCancel: () => void
  onConfirm: (payload: any) => void
  initialValues: any
  providerId: string
  venueId: string
}

export const CinemaProviderFormDialog = ({
  onCancel,
  onConfirm,
  initialValues,
  providerId,
  venueId,
}: ICinemaProviderFormDialogProps) => {
  return (
    <DialogBox
      extraClassNames="cinema-provider-form-dialog"
      labelledBy="cinema-provider-form-dialog"
      onDismiss={onCancel}
      hasCloseButton
    >
      <div className="title">
        <strong>Modifier mes offres</strong>
      </div>
      <div className="explanation">
        Les modifications s’appliqueront uniquement aux nouvelles offres créées.
        La modification doit être faite manuellement pour les offres existantes.
      </div>
      <CinemaProviderForm
        initialValues={initialValues}
        onCancel={onCancel}
        saveVenueProvider={onConfirm}
        providerId={providerId}
        venueId={venueId}
      />
    </DialogBox>
  )
}