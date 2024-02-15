import { handleController } from '~~/utils'
import {
  getForexTransaction,
  getForexTransactions,
  updateTransactionStatusQuery,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async () => {
    try {
      return await getForexTransactions()
    } catch (error) {
      throw new Error(`Failed to fetch Forex transactions: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexTransaction(params.id) // Changed uuid to id, adjust as needed
    } catch (error) {
      throw new Error(`Failed to fetch Forex transaction: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const response = await updateTransactionStatusQuery(
        params.uuid,
        body.status,
        body.message,
      )
      return {
        ...response,
        message: 'Transaction status updated successfully',
      }
    } catch (error) {
      throw new Error(`Failed to update Forex transaction: ${error.message}`)
    }
  }),
}
