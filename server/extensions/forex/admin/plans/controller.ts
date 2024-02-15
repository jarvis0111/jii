import { handleController } from '~~/utils'
import {
  createForexPlan,
  deleteForexPlan,
  getForexPlan,
  getForexPlans,
  updateForexPlan,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getForexPlans()
    } catch (error) {
      throw new Error(`Failed to fetch Forex plans: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexPlan(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch Forex plan: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    const {
      name,
      title,
      description,
      min_amount,
      max_amount,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      invested,
      status,
      image,
      trending,
      durations,
    } = body.plan
    try {
      return await createForexPlan(
        name,
        title,
        description,
        min_amount,
        max_amount,
        profit_percentage,
        min_profit,
        max_profit,
        default_profit,
        default_result,
        durations,
        invested,
        status,
        image,
        trending,
      )
    } catch (error) {
      throw new Error(`Failed to create plan: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    const {
      name,
      title,
      description,
      min_amount,
      max_amount,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      invested,
      status,
      image,
      trending,
      durations,
    } = body.plan

    try {
      return await updateForexPlan(
        Number(params.id),
        name,
        title,
        description,
        min_amount,
        max_amount,
        profit_percentage,
        min_profit,
        max_profit,
        default_profit,
        default_result,
        durations,
        invested,
        status,
        image,
        trending,
      )
    } catch (error) {
      throw new Error(`Failed to update Forex plan: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      return await deleteForexPlan(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to delete Forex plan: ${error.message}`)
    }
  }),
}
