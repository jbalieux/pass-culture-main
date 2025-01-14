import { IStockEventFormValues, IStockEventFormHiddenValues } from './types'

const STOCK_EVENT_FORM_DEFAULT_HIDDEN_VALUES: IStockEventFormHiddenValues = {
  stockId: undefined,
  isDeletable: true,
  readOnlyFields: [],
}

export const STOCK_EVENT_FORM_DEFAULT_VALUES: IStockEventFormValues = {
  beginningDate: null,
  beginningTime: null,
  remainingQuantity: '',
  bookingsQuantity: '',
  quantity: '',
  bookingLimitDatetime: null,
  price: '',
  ...STOCK_EVENT_FORM_DEFAULT_HIDDEN_VALUES,
}

// 'price','quantity','bookingLimitDatetime', are editable
export const STOCK_EVENT_ALLOCINE_READ_ONLY_FIELDS = [
  'beginningDate',
  'beginningTime',
]
