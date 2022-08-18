import { CollectiveOfferResponseModel } from 'apiClient'
import { api } from 'apiClient/api'
import { Adapter, AdapterFailure } from 'app/types'

type GetCollectiveOfferAdapter = Adapter<
  number,
  CollectiveOfferResponseModel,
  null
>

const FAILING_RESPONSE: AdapterFailure<null> = {
  isOk: false,
  message: 'Nous avons rencontré un problème lors du chargemement des données',
  payload: null,
}

export const getCollectiveOfferAdapter: GetCollectiveOfferAdapter =
  async offerId => {
    try {
      const result = await api.getCollectiveOffer(offerId)

      return {
        isOk: true,
        message: null,
        payload: result,
      }
    } catch (e) {
      return FAILING_RESPONSE
    }
  }
