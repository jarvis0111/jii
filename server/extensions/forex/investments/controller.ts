import { createLogger } from '../../../logger'
import { handleController } from '../../../utils'
import {
  cancelInvestment,
  checkInvestment,
  createInvestment,
  getInvestments,
  getUserActiveInvestments,
  processForexInvestments,
} from './queries'
const logger = createLogger('Forex Investments')

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await getInvestments(user.id)
    } catch (error) {
      throw new Error(`Failed to fetch Forex investments: ${error.message}`)
    }
  }),

  active: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await getUserActiveInvestments(user.id)
    } catch (error) {
      throw new Error(`Failed to fetch Forex investments: ${error.message}`)
    }
  }),

  status: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await checkInvestment(params.uuid)
    } catch (error) {
      throw new Error(`Failed to fetch Forex investment: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { accountId, planId, durationId, amount } = body
      return await createInvestment(
        user.id,
        accountId,
        planId,
        durationId,
        amount,
      )
    } catch (error) {
      throw new Error(`Failed to create Forex investment: ${error.message}`)
    }
  }),

  cancel: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { id } = params
      return await cancelInvestment(user.id, id)
    } catch (error) {
      throw new Error(`Failed to cancel Forex investment: ${error.message}`)
    }
  }),

  cron: handleController(async () => {
    try {
      await processForexInvestments()
    } catch (error) {
      throw new Error(error)
    }
  }),
}
