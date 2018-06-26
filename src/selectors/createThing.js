import get from 'lodash.get'
import { createSelector } from 'reselect'

const createThingSelect = () => createSelector(
  state => state.data.things,
  (state, params) => params,
  (things, thingId) => things.find(thing => thing.id === thingId)
)
export default createThingSelect
