import { handleController } from '~~/utils'
import {
  createForexAccount,
  deleteForexAccount,
  getForexAccount,
  getForexAccounts,
  updateForexAccount,
} from './queries' // Please implement these query functions

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getForexAccounts()
    } catch (error) {
      throw new Error(`Failed to fetch Forex accounts: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getForexAccount(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch Forex account: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    try {
      const {
        account_id,
        password,
        mt,
        broker,
        type,
        status,
        balance,
        leverage,
      } = body
      const newAccount = await createForexAccount(
        account_id,
        password,
        Number(mt),
        broker,
        type,
        status,
        balance,
        leverage,
      )
      return newAccount
    } catch (error) {
      throw new Error(`Failed to create Forex account: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const {
        account_id,
        password,
        mt,
        broker,
        type,
        status,
        balance,
        leverage,
      } = body
      const updatedAccount = await updateForexAccount(
        Number(params.id),
        account_id,
        password,
        Number(mt),
        broker,
        type,
        status,
        balance,
        leverage,
      )
      return updatedAccount
    } catch (error) {
      throw new Error(`Failed to update Forex account: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedAccount = await deleteForexAccount(Number(params.id))
      return deletedAccount
    } catch (error) {
      throw new Error(`Failed to delete Forex account: ${error.message}`)
    }
  }),
}
