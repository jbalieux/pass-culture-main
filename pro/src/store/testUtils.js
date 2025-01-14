import merge from 'lodash.merge'

import createStore from 'store'
import { initialState as appInitialState } from 'store/app/reducer'
import { initialState as featuresInitialState } from 'store/features/reducer'
import { initialState as offersInitialState } from 'store/offers/reducer'
import { initialState as bookingSummaryInitialState } from 'store/reducers/bookingSummary/bookingSummary'
import { initialState as errorsInitialState } from 'store/reducers/errors'
import { initialState as maintenanceInitialState } from 'store/reducers/maintenanceReducer'
import { initialState as notificationInitialState } from 'store/reducers/notificationReducer'
import { initialState as userInitialState } from 'store/user/reducer'

export const configureTestStore = overrideData => {
  const initialData = {
    app: { ...appInitialState },
    bookingSummary: bookingSummaryInitialState,
    features: { ...featuresInitialState, initialized: true },
    errors: errorsInitialState,
    maintenance: maintenanceInitialState,
    notification: notificationInitialState,
    offers: offersInitialState,
    user: userInitialState,
  }

  return createStore(merge({}, initialData, overrideData)).store
}
