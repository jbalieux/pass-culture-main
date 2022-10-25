import {
  Backdrop,
  Card,
  Chip,
  CircularProgress,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { captureException } from '@sentry/react'
import React, { useEffect, useState } from 'react'
import {
  useAuthenticated,
  useNotify,
  usePermissions,
  useRedirect,
} from 'react-admin'

import { searchPermission } from '../../../helpers/functions'
import { Colors } from '../../../layout/Colors'
import {
  getGenericHttpErrorMessage,
  getHttpApiErrorMessage,
  PcApiHttpError,
} from '../../../providers/apiHelpers'
import { apiProvider } from '../../../providers/apiProvider'
import { OffererToBeValidated } from '../../../TypesFromApi'
import { PermissionsEnum } from '../../PublicUsers/types'
import { OfferersToValidateContextTableMenu } from '../Components/OfferersToValidateContextTableMenu'

export const OfferersToValidate = () => {
  useAuthenticated()
  const notify = useNotify()
  const redirect = useRedirect()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    offerers: [] as OffererToBeValidated[],
    total: 0,
    totalPages: 0,
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { permissions } = usePermissions()
  const formattedAuthorizations: PermissionsEnum[] = permissions
  const permissionGranted = !!searchPermission(
    formattedAuthorizations,
    PermissionsEnum.validateOfferer
  )

  async function getOfferersToBeValidated(page: number) {
    try {
      const response = await apiProvider().listOfferersToBeValidated({
        page: page + 1,
        perPage: rowsPerPage,
        sort: JSON.stringify([{ field: 'name', order: 'asc' }]),
      })
      if (response && response.data && response.data.length > 0) {
        setData({
          offerers: response.data,
          total: response.total,
          totalPages: response.pages,
        })
      }
    } catch (error) {
      if (error instanceof PcApiHttpError) {
        notify(getHttpApiErrorMessage(error), { type: 'error' })
      } else {
        notify(await getGenericHttpErrorMessage(error as Response), {
          type: 'error',
        })
      }
      redirect('/pro/search')
      captureException(error)
    }
  }

  async function onChangePage(
    event: React.MouseEvent<HTMLButtonElement> | null,
    value: number
  ) {
    setIsLoading(true)
    await getOfferersToBeValidated(value)
    setIsLoading(false)
    setCurrentPage(value)
  }

  const onChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setCurrentPage(0)
  }
  const offererToValidateManagement = async () => {
    await getOfferersToBeValidated(currentPage)
  }

  useEffect(() => {
    offererToValidateManagement()
  }, [rowsPerPage])

  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {permissionGranted && (
        <>
          <Card sx={{ padding: 2, mt: 5 }}>
            <Typography variant={'h4'} color={Colors.GREY}>
              Structures à valider
            </Typography>
            {data.total === 0 && (
              <>Il n'y a pas de structure à valider pour le moment</>
            )}

            {data.total > 0 && (
              <>
                <Table size="small" sx={{ mt: 3 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Nom de la structure</TableCell>
                      <TableCell>Top Acteur</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Dernier Commentaire</TableCell>
                      <TableCell>SIREN</TableCell>
                      <TableCell>Responsable Structure</TableCell>
                      <TableCell>Adresse</TableCell>
                      <TableCell>CP</TableCell>
                      <TableCell>Ville</TableCell>
                      <TableCell>Tél</TableCell>
                      <TableCell>Mail</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.offerers.map(offerer => (
                      <TableRow key={offerer.id}>
                        <TableCell>
                          <OfferersToValidateContextTableMenu id={offerer.id} />
                        </TableCell>
                        <TableCell>{offerer.id}</TableCell>
                        <TableCell>{offerer.name}</TableCell>
                        <TableCell>
                          <Chip label={offerer.status} />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={offerer.isTopActor === true}
                            onChange={async () => {
                              try {
                                await apiProvider().toggleTopActor({
                                  offererId: offerer.id,
                                  isTopActorRequest: {
                                    isTopActor: !offerer.isTopActor,
                                  },
                                })
                                notify(
                                  'Le mise à jour a été effectuée avec succès !',
                                  { type: 'success' }
                                )
                              } catch (error) {
                                if (error instanceof PcApiHttpError) {
                                  notify(getHttpApiErrorMessage(error), {
                                    type: 'error',
                                  })
                                } else {
                                  notify(
                                    await getGenericHttpErrorMessage(
                                      error as Response
                                    ),
                                    {
                                      type: 'error',
                                      messageArgs: (error as Response).status,
                                    }
                                  )
                                }
                                captureException(error)
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {offerer.lastComment && offerer.lastComment.content}
                        </TableCell>
                        <TableCell>{offerer.siren}</TableCell>
                        <TableCell>{offerer.owner}</TableCell>
                        <TableCell>{offerer.address}</TableCell>
                        <TableCell>{offerer.postalCode}</TableCell>
                        <TableCell>{offerer.city}</TableCell>
                        <TableCell>{offerer.phoneNumber}</TableCell>
                        <TableCell>{offerer.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TablePagination
                    count={data.total}
                    page={currentPage}
                    onPageChange={onChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onChangeRowsPerPage}
                    labelRowsPerPage={'Structures par page'}
                    labelDisplayedRows={({ from, to, count }) =>
                      from + ' à ' + to + ' sur ' + count
                    }
                  />
                </Table>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
