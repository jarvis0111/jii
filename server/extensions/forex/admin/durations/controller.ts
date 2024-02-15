import type { ForexTimeframe } from '~~/types' // Please define this type
import { handleController } from '~~/utils'
import {
  createForexDuration,
  deleteForexDuration,
  getForexDuration,
  getForexDurations,
  updateForexDuration,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getForexDurations()
    } catch (error) {
      throw new Error(`Failed to fetch Forex durations: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexDuration(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch Forex duration: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    try {
      const newDuration = await createForexDuration(
        body.duration.duration,
        body.duration.timeframe as ForexTimeframe,
      )
      return newDuration
    } catch (error) {
      throw new Error(`Failed to create Forex duration: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const updatedDuration = await updateForexDuration(
        Number(params.id),
        body.duration.duration,
        body.duration.timeframe as ForexTimeframe,
      )
      return updatedDuration
    } catch (error) {
      throw new Error(`Failed to update Forex duration: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedDuration = await deleteForexDuration(Number(params.id))
      return deletedDuration
    } catch (error) {
      throw new Error(`Failed to delete Forex duration: ${error.message}`)
    }
  }),
}
