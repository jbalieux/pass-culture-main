import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router'
import { Link } from 'react-router-dom'

import * as useAnalytics from 'hooks/useAnalytics'
import useLogNavigation from 'hooks/useLogNavigation'
import { configureTestStore } from 'store/testUtils'

const mockLogEvent = jest.fn()

const NavigationLogger = (): null => {
  useLogNavigation()
  return null
}

describe('useLogNavigation', () => {
  it('should log an event on location changes', async () => {
    // When
    jest.spyOn(useAnalytics, 'default').mockImplementation(() => ({
      logEvent: mockLogEvent,
      setLogEvent: null,
    }))

    const store = configureTestStore({})
    render(
      <Provider store={store}>
        <MemoryRouter>
          <NavigationLogger />
          <Route path="*">
            <span>Main page</span>
            <Link to="/structures">Structures</Link>
          </Route>
          <Route path="/structures">
            <span>Structure page</span>
            <Link to="/">Accueil</Link>
          </Route>
        </MemoryRouter>
      </Provider>
    )

    const button = screen.getByRole('link', { name: 'Structures' })
    await userEvent.click(button)
    const homeButton = screen.getByRole('link', { name: 'Accueil' })
    await userEvent.click(homeButton)
    expect(mockLogEvent).toHaveBeenCalledTimes(3)
    expect(mockLogEvent).toHaveBeenNthCalledWith(1, 'page_view', { from: '/' })
    expect(mockLogEvent).toHaveBeenNthCalledWith(2, 'page_view', {
      from: '/structures',
    })
    expect(mockLogEvent).toHaveBeenNthCalledWith(3, 'page_view', { from: '/' })
  })
})
