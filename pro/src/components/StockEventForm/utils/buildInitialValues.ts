import { OfferStatus } from 'apiClient/v1'
import { IOfferIndividualStock } from 'core/Offers/types'
import { getLocalDepartementDateTimeFromUtc } from 'utils/timezone'

import { STOCK_EVENT_FORM_DEFAULT_VALUES } from '../constants'
import { IStockEventFormValues } from '../types'
import { setFormReadOnlyFields } from '../utils'

interface IBuildSingleInitialValuesArgs {
  departmentCode: string
  stock: IOfferIndividualStock
  today: Date
  lastProviderName: string | null
  offerStatus: OfferStatus
}

export const buildSingleInitialValues = ({
  departmentCode,
  stock,
  today,
  lastProviderName,
  offerStatus,
}: IBuildSingleInitialValuesArgs): IStockEventFormValues => {
  const hiddenValues = {
    stockId: stock.id,
    isDeletable: stock.isEventDeletable,
    readOnlyFields: setFormReadOnlyFields({
      beginningDate: stock.beginningDatetime
        ? new Date(stock.beginningDatetime)
        : null,
      today,
      lastProviderName: lastProviderName,
      offerStatus,
    }),
  }

  return {
    ...hiddenValues,
    remainingQuantity: stock.remainingQuantity?.toString() || 'unlimited',
    bookingsQuantity: stock.bookingsQuantity.toString(),
    quantity: stock.quantity?.toString() || '',
    beginningDate: stock.beginningDatetime
      ? getLocalDepartementDateTimeFromUtc(
          stock.beginningDatetime,
          departmentCode
        )
      : null,
    beginningTime: stock.beginningDatetime
      ? getLocalDepartementDateTimeFromUtc(
          stock.beginningDatetime,
          departmentCode
        )
      : null,
    bookingLimitDatetime: stock.bookingLimitDatetime
      ? getLocalDepartementDateTimeFromUtc(
          stock.bookingLimitDatetime,
          departmentCode
        )
      : null,
    price: stock.price.toString(),
  }
}

export interface IBuildInitialValuesArgs {
  departmentCode: string
  offerStocks: IOfferIndividualStock[]
  today: Date
  lastProviderName: string | null
  offerStatus: OfferStatus
}

export const buildInitialValues = ({
  departmentCode,
  offerStocks,
  today,
  lastProviderName,
  offerStatus,
}: IBuildInitialValuesArgs): { stocks: IStockEventFormValues[] } => {
  return {
    stocks:
      offerStocks.length > 0
        ? offerStocks.map(stock =>
            buildSingleInitialValues({
              departmentCode,
              stock,
              today,
              lastProviderName,
              offerStatus,
            })
          )
        : [STOCK_EVENT_FORM_DEFAULT_VALUES],
  }
}
