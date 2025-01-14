import '@testing-library/jest-dom'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { api } from 'apiClient/api'
import { Events } from 'core/FirebaseEvents/constants'
import * as useAnalytics from 'hooks/useAnalytics'
import { renderOffer } from 'pages/Offers/Offer/__specs__/render'
import { offerFactory } from 'utils/apiFactories'

window.open = jest.fn()

const mockLogEvent = jest.fn()

jest.mock('utils/config', () => {
  return {
    WEBAPP_URL: 'http://localhost',
  }
})

jest.mock('apiClient/api', () => ({
  api: {
    getOfferer: jest.fn(),
    patchOffersActiveStatus: jest.fn(),
    getOffer: jest.fn(),
    listOfferersNames: jest.fn(),
    getVenues: jest.fn(),
    getCategories: jest.fn(),
  },
}))

describe('confirmation page', () => {
  let categories
  let offer

  beforeEach(() => {
    categories = {
      categories: [
        {
          id: 'ID',
          name: 'Musique',
          proLabel: 'Musique',
          appLabel: 'Musique',
          isSelectable: true,
        },
      ],
      subcategories: [
        {
          id: 'ID',
          name: 'Musique SubCat 1',
          categoryId: 'ID',
          isEvent: false,
          isDigital: false,
          isDigitalDeposit: false,
          isPhysicalDeposit: true,
          proLabel: 'Musique SubCat 1',
          appLabel: 'Musique SubCat 1',
          conditionalFields: ['author', 'musicType', 'performer'],
          canExpire: true,
          canBeDuo: false,
          isSelectable: true,
        },
      ],
    }
    jest.spyOn(api, 'getCategories').mockResolvedValue(categories)
    offer = offerFactory({
      name: 'mon offre',
      status: 'DRAFT',
      venueId: 'VENUEID',
    })
    jest.spyOn(api, 'getOffer').mockResolvedValue(offer)
    jest.spyOn(useAnalytics, 'default').mockImplementation(() => ({
      logEvent: mockLogEvent,
      setLogEvent: null,
    }))
    api.getVenues.mockResolvedValue({
      venues: [{ id: 'AB', publicName: 'venue', name: 'venue' }],
    })
    api.listOfferersNames.mockResolvedValue({ offerersNames: [] })
  })

  it('should track when clicking on offer creation button', async () => {
    // Given
    renderOffer({
      pathname: `/offre/${offer.id}/individuel/creation/confirmation`,
    })

    // When
    await userEvent.click(await screen.findByText('Créer une nouvelle offre'))

    // Then
    expect(mockLogEvent).toHaveBeenCalledTimes(1)
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      Events.CLICKED_OFFER_FORM_NAVIGATION,
      {
        from: 'confirmation',
        isEdition: false,
        to: 'details',
        used: 'ConfirmationButtonNewOffer',
      }
    )
  })

  it('should track when clicking on got to offers button', async () => {
    // Given
    renderOffer({
      pathname: `/offre/${offer.id}/individuel/creation/confirmation`,
    })

    // When
    await userEvent.click(await screen.findByText('Voir la liste des offres'))

    // Then
    expect(mockLogEvent).toHaveBeenCalledTimes(1)
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      Events.CLICKED_OFFER_FORM_NAVIGATION,
      {
        from: 'confirmation',
        isEdition: false,
        to: 'Offers',
        used: 'ConfirmationButtonOfferList',
      }
    )
  })

  it('should track when clicking on view in app link', async () => {
    // Given
    renderOffer({
      pathname: `/offre/${offer.id}/individuel/creation/confirmation`,
    })

    // When
    await userEvent.click(
      await screen.findByText('Visualiser l’offre dans l’application')
    )

    // Then
    expect(mockLogEvent).toHaveBeenCalledTimes(1)
    expect(mockLogEvent).toHaveBeenNthCalledWith(
      1,
      Events.CLICKED_OFFER_FORM_NAVIGATION,
      {
        from: 'confirmation',
        isEdition: false,
        to: 'AppPreview',
        used: 'ConfirmationPreview',
      }
    )
  })
})
