import PropTypes from 'prop-types'
import React, { useCallback } from 'react'

import { api } from 'apiClient/api'
import ConfirmDialog from 'components/Dialog/ConfirmDialog'
import useNotification from 'hooks/useNotification'
import { ReactComponent as Trash } from 'icons/ico-trash.svg'

const DeleteStockDialog = ({ isEvent, onDelete, setIsDeleting, stockId }) => {
  const DIALOG_LABEL_ID = 'DIALOG_LABEL_ID'
  const notification = useNotification()

  const confirmStockDeletion = useCallback(() => {
    api
      .deleteStock(stockId)
      .then(() => {
        notification.success('Le stock a été supprimé.')
        onDelete()
      })
      .catch(() =>
        notification.error(
          'Une erreur est survenue lors de la suppression du stock.'
        )
      )
  }, [onDelete, stockId])

  const abortStockDeletion = useCallback(
    () => setIsDeleting(false),
    [setIsDeleting]
  )

  return (
    <ConfirmDialog
      labelledBy={DIALOG_LABEL_ID}
      onCancel={abortStockDeletion}
      onConfirm={confirmStockDeletion}
      title="Voulez-vous supprimer ce stock ?"
      confirmText="Supprimer"
      cancelText="Annuler"
      icon={Trash}
    >
      <p>
        {'Ce stock ne sera plus disponible à la réservation et '}
        <strong>
          entraînera l’annulation des réservations en cours
          {isEvent && ' et validées'} !
        </strong>
      </p>
      <p>
        L’ensemble des utilisateurs concernés sera automatiquement averti par
        e-mail.
      </p>
    </ConfirmDialog>
  )
}

DeleteStockDialog.propTypes = {
  isEvent: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  setIsDeleting: PropTypes.func.isRequired,
  stockId: PropTypes.string.isRequired,
}

export default DeleteStockDialog
