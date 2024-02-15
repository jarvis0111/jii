import { handleController } from '~~/utils'

import { getForexCountsPerDay } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, user) => {
    if (!user) {
      throw new Error('Unauthorized')
    }

    try {
      return await getForexCountsPerDay()
    } catch (error) {
      throw new Error(`Failed to fetch Forex analytics data: ${error.message}`)
    }
  }),
}
