import { handleController } from '~~/utils'
import {
  deleteForexInvestment,
  getForexInvestment,
  getForexInvestments,
  updateForexInvestment,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async () => {
    try {
      return await getForexInvestments()
    } catch (error) {
      throw new Error(`Failed to fetch Forex investments: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexInvestment(params.id) // Changed uuid to id, adjust as needed
    } catch (error) {
      throw new Error(`Failed to fetch Forex investment: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const updatedInvestment = await updateForexInvestment(
        params.id, // Changed uuid to id, adjust as needed
        body.profit,
        body.result,
      )
      return updatedInvestment
    } catch (error) {
      throw new Error(`Failed to update Forex investment: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedInvestment = await deleteForexInvestment(Number(params.id))
      return deletedInvestment
    } catch (error) {
      throw new Error(`Failed to delete Forex investment: ${error.message}`)
    }
  }),
}
