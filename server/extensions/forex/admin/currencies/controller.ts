import { handleController } from '~~/utils'
import {
  createForexCurrency,
  deleteForexCurrency,
  getForexCurrencies,
  getForexCurrency,
  updateForexCurrency,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async () => {
    try {
      return await getForexCurrencies()
    } catch (error) {
      throw new Error(`Failed to fetch Forex currencies: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexCurrency(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch Forex currency: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    try {
      const { currency, status } = body
      const newCurrency = await createForexCurrency(currency, status === 'true')
      return newCurrency
    } catch (error) {
      throw new Error(`Failed to create Forex currency: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const { currency, status } = body
      const updatedCurrency = await updateForexCurrency(
        Number(params.id),
        currency,
        status === 'true',
      )
      return updatedCurrency
    } catch (error) {
      throw new Error(`Failed to update Forex currency: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedCurrency = await deleteForexCurrency(Number(params.id))
      return deletedCurrency
    } catch (error) {
      throw new Error(`Failed to delete Forex currency: ${error.message}`)
    }
  }),
}
