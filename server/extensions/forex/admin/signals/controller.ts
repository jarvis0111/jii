import type { ForexTimeframe } from '~~/types' // Please define this type
import { handleController } from '~~/utils'
import {
  createForexSignal,
  deleteForexSignal,
  getForexSignal,
  getForexSignals,
  updateForexSignal,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getForexSignals()
    } catch (error) {
      throw new Error(`Failed to fetch Forex signals: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexSignal(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch Forex signal: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    try {
      const { title, image, status } = body
      const newSignal = await createForexSignal(title, image, status)
      return newSignal
    } catch (error) {
      throw new Error(`Failed to create Forex signal: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const { title, image, status } = body
      const updatedSignal = await updateForexSignal(
        Number(params.id),
        title,
        image,
        status,
      )
      return updatedSignal
    } catch (error) {
      throw new Error(`Failed to update Forex signal: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedSignal = await deleteForexSignal(Number(params.id))
      return deletedSignal
    } catch (error) {
      throw new Error(`Failed to delete Forex signal: ${error.message}`)
    }
  }),
}
