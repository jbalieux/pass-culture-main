import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import { createBrowserHistory } from 'history'
import React from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router'

import { SharedCurrentUserResponseModel } from 'apiClient/v1'
import * as useNewOfferCreationJourney from 'hooks/useNewOfferCreationJourney'
import { configureTestStore } from 'store/testUtils'

import { VenueFormActionBar } from '../index'

const renderVanueFormActionBar = ({
  isCreatingVenue,
}: {
  isCreatingVenue: boolean
}) => {
  render(
    <Provider
      store={configureTestStore({
        user: {
          initialized: true,
          currentUser: {
            id: 'EY',
            isAdmin: true,
            publicName: 'USER',
          } as SharedCurrentUserResponseModel,
        },
        features: {
          list: [
            {
              nameKey: 'WIP_ENABLE_NEW_OFFER_CREATION_JOURNEY',
              isActive: true,
            },
          ],
          initialized: true,
        },
      })}
    >
      <Router history={createBrowserHistory()}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <VenueFormActionBar
            isCreatingVenue={isCreatingVenue}
            offererId="59"
          />
        </Formik>
      </Router>
    </Provider>
  )
}
jest.mock('hooks/useRemoteConfig', () => ({
  __esModule: true,
  default: () => ({ remoteConfig: {} }),
}))

jest.mock('hooks/useNewOfferCreationJourney', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}))

jest.mock('@firebase/remote-config', () => ({
  getValue: () => ({ asBoolean: () => true }),
}))

describe('VenueFormActionBar', () => {
  it('should display right message on creation', async () => {
    jest.mock('@firebase/remote-config', () => ({
      getValue: () => ({ asBoolean: () => false }),
    }))

    renderVanueFormActionBar({ isCreatingVenue: true })
    expect(screen.getByText('Enregistrer et continuer')).toBeInTheDocument()
  })

  it('should display right message on edition', async () => {
    renderVanueFormActionBar({ isCreatingVenue: false })
    expect(screen.getByText('Enregistrer et quitter')).toBeInTheDocument()
  })

  describe('with ab testing', () => {
    beforeEach(() => {
      jest.spyOn(useNewOfferCreationJourney, 'default').mockReturnValue(true)
    })
    it('should display right message on creation with a/b testing access', async () => {
      renderVanueFormActionBar({ isCreatingVenue: true })
      expect(
        screen.getByText('Enregistrer et créer le lieu')
      ).toBeInTheDocument()
    })
  })
})
