import { handleController } from '~~/utils'
import { depositQuery, getAccount, getAccounts, withdrawQuery } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await getAccounts(user.id)
    } catch (error) {
      throw new Error(`Failed to fetch Forex investments: ${error.message}`)
    }
  }),
  show: handleController(async (_, __, params, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await getAccount(params.id, user.id)
    } catch (error) {
      throw new Error(`Failed to fetch Forex investment: ${error.message}`)
    }
  }),

  deposit: handleController(async (_, __, params, ___, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { walletUuid, amount } = body
      if (!amount) throw new Error('Amount is required for deposit')
      return await depositQuery(user.id, params.id, walletUuid, amount)
    } catch (error) {
      throw new Error(`Failed to process deposit: ${error.message}`)
    }
  }),

  withdraw: handleController(async (_, __, params, ___, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      const { currency, amount } = body
      if (!amount) throw new Error('Amount is required for withdrawal')
      return await withdrawQuery(user.id, params.id, currency, amount)
    } catch (error) {
      throw new Error(`Failed to process withdrawal: ${error.message}`)
    }
  }),
}
