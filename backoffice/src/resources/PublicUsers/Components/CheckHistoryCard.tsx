import { Card } from '@material-ui/core'
import {
  Collapse,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import moment from 'moment'
import React, { useState } from 'react'

import { snakeCaseToTitleCase } from '../../../tools/textTools'
import { EligibilityFraudCheck, FraudCheck } from '../types'

import { StatusAvatar } from './StatusAvatar'
import { BeneficiaryBadge } from './BeneficiaryBadge'

type Props = {
  fraudCheck: EligibilityFraudCheck
}

export const CheckHistoryCard = ({ fraudCheck }: Props) => {
  const cardStyle = {
    width: '100%',
    marginTop: '20px',
    padding: 30,
  }
  const gridStyle = { width: '100%', height: '100%', overflow: 'auto' }

  const [checked, setChecked] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
  }

  const beneficiaryBadge = <BeneficiaryBadge role={fraudCheck.role} />
  const fraudCheckItem = fraudCheck.items[0]
  return (
    <Card style={cardStyle}>
      <Grid container spacing={1}>
        <Typography variant={'h5'}>
          {fraudCheckItem.type &&
            snakeCaseToTitleCase(fraudCheckItem.type as string)}
          <span style={{ marginLeft: '3rem' }}>{beneficiaryBadge}</span>
        </Typography>
        <Grid container spacing={1} sx={{ mt: 4 }}>
          <Stack spacing={2} direction={'row'} style={{ width: '100%' }}>
            <Grid item xs={6}>
              <p>Date de création</p>
            </Grid>
            <Grid item xs={6}>
              <p>
                {moment(fraudCheckItem.dateCreated).format(
                  'D/MM/YYYY à HH:mm:s'
                )}
              </p>
            </Grid>
          </Stack>
          <Stack spacing={3} direction={'row'} style={{ width: '100%' }}>
            <Grid item xs={6}>
              <p>ID Technique</p>
            </Grid>
            <Grid item xs={6}>
              <p>{fraudCheckItem.thirdPartyId}</p>
            </Grid>
          </Stack>
          <Stack spacing={3} direction={'row'} style={{ width: '100%' }}>
            <Grid item xs={6}>
              <p>Statut</p>
            </Grid>
            <Grid item xs={6}>
              <p>
                <StatusAvatar item={fraudCheckItem} />
              </p>
            </Grid>
          </Stack>
          <Stack spacing={3} direction={'row'} style={{ width: '100%' }}>
            <Grid item xs={6}>
              <p>Explication</p>
            </Grid>
            <Grid item xs={6}>
              <p>{fraudCheckItem.reason}</p>
            </Grid>
          </Stack>
          <Stack spacing={3} direction={'row'} style={{ width: '100%' }}>
            <Grid item xs={6}>
              <p>Code d'erreurs</p>
            </Grid>
            <Grid item xs={6}>
              <p>{fraudCheckItem.reasonCodes && fraudCheckItem.reasonCodes}</p>
            </Grid>
          </Stack>

          <Stack spacing={3} direction={'row'} style={{ width: '100%' }}>
            <Grid item xs={6}>
              <p>Détails techniques</p>
              <FormControlLabel
                control={
                  <Switch
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                    name={fraudCheckItem.type}
                  />
                }
                label="Afficher les détails techniques"
              />
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={0}>
                <Grid item style={gridStyle}>
                  <Collapse in={checked}>
                    <pre>
                      <code>
                        {fraudCheckItem.technicalDetails &&
                          JSON.stringify(
                            fraudCheckItem.technicalDetails,
                            undefined,
                            4
                          )}
                      </code>
                    </pre>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  )
}
