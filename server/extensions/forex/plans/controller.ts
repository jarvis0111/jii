import { handleController } from '~~/utils'
import { getForexPlans } from './queries' // Please implement this query function

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getForexPlans()
    } catch (error) {
      throw new Error(`Failed to fetch Forex plans: ${error.message}`)
    }
  }),
}
