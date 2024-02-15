import { generateWalletAddressQuery } from '~~/http/wallets/spot/controller'
import { createWalletQuery } from '~~/http/wallets/spot/queries'
import { createLogger } from '~~/logger'
import type { ForexAccount, Transaction } from '~~/types'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'
const logger = createLogger('SpotWallets')

export async function getAccounts(
  userId: number,
): Promise<{ [key: string]: ForexAccount }> {
  const types: ('DEMO' | 'LIVE')[] = ['DEMO', 'LIVE']
  const accounts: { [key: string]: ForexAccount } = {}

  // Fetch existing accounts for the user
  const userAccounts = await prisma.forex_account.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
      account_id: true,
      broker: true,
      status: true,
      type: true,
      mt: true,
      balance: true,
      leverage: true,
      password: true,
      user: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  })

  // Map existing user accounts by type for quick lookup
  const existingTypes = new Set(userAccounts.map((account) => account.type))

  for (const type of types) {
    try {
      if (existingTypes.has(type)) {
        // Account of this type already exists for the user
        accounts[type] = userAccounts.find(
          (account) => account.type === type,
        ) as unknown as ForexAccount
      } else {
        // Try to find an unassigned account of this type
        const unassignedAccount = await prisma.forex_account.findFirst({
          where: {
            user_id: null,
            type: type,
          },
        })

        let account
        if (unassignedAccount) {
          // Update unassigned account with the user_id
          account = await prisma.forex_account.update({
            where: { id: unassignedAccount.id },
            data: { user_id: userId, status: true },
          })
        } else {
          // Create new account
          account = await prisma.forex_account.create({
            data: {
              user_id: userId,
              type: type,
              status: false,
            },
          })
        }
        accounts[type] = account as unknown as ForexAccount
      }
    } catch (error) {
      console.error(
        `An error occurred while upserting the account for userId: ${userId}, type: ${type}`,
        error,
      )
    }
  }

  return accounts
}

export async function getAccount(
  accountId: string,
  userId: number,
): Promise<ForexAccount | null> {
  return (await prisma.forex_account.findFirst({
    where: { account_id: accountId, user_id: userId },
  })) as unknown as ForexAccount
}

export async function depositQuery(
  userId: number,
  accountId: string,
  walletUuid: string,
  amount: number,
): Promise<Transaction> {
  // Validate amount
  if (amount <= 0) throw new Error('Amount must be greater than zero')

  const account = await prisma.forex_account.findFirst({
    where: { user_id: userId, type: 'LIVE', account_id: accountId },
  })
  if (!account || !account.account_id) throw new Error('Account not found')

  const wallet = await prisma.wallet.findUnique({
    where: {
      uuid: walletUuid,
    },
  })

  if (!wallet) throw new Error('Wallet not found')
  if (wallet.balance < amount) throw new Error('Insufficient balance')
  const walletType = await prisma.settings.findFirst({
    where: {
      key: 'forex_deposit_wallet_type',
    },
  })

  let currency
  switch (walletType?.value) {
    case 'FIAT':
      currency = await prisma.currency.findUnique({
        where: {
          code: wallet.currency,
        },
      })
      break
    case 'SPOT':
      currency = await prisma.exchange_currency.findUnique({
        where: {
          currency: wallet.currency,
        },
      })
      break
    case 'FUNDING':
      currency = await prisma.ecosystem_token.findFirst({
        where: {
          currency: wallet.currency,
        },
      })
    default:
      break
  }
  if (!currency) throw new Error('Currency not found')

  const newWalletBalance = wallet.balance - amount

  try {
    const result = await prisma.$transaction([
      prisma.wallet.update({
        where: { uuid: walletUuid },
        data: { balance: newWalletBalance },
      }),
      prisma.transaction.create({
        data: {
          uuid: makeUuid(),
          user_id: userId,
          wallet_id: wallet.id,
          type: 'FOREX_DEPOSIT',
          status: 'PENDING',
          amount,
          description: `Deposit to forex account ID: ${accountId}`,
          metadata: {
            currency: currency.currency,
            price: currency.price,
          },
        },
      }),
    ])
    return result[1] as unknown as Transaction
  } catch (error) {
    console.error(
      `An error occurred while processing deposit for userId: ${userId}, account ID: ${accountId}, amount: ${amount}`,
      error,
    )
    throw error
  }
}

export async function withdrawQuery(
  userId: number,
  accountId: string,
  currencyId: string,
  amount: number,
): Promise<Transaction> {
  // Validate amount
  if (amount <= 0) throw new Error('Amount must be greater than zero')

  const account = await prisma.forex_account.findFirst({
    where: { user_id: userId, type: 'LIVE', account_id: accountId },
  })
  if (!account) throw new Error('Account not found')
  if (account.balance < amount) throw new Error('Insufficient balance')

  let wallet = await prisma.wallet.findFirst({
    where: {
      user_id: userId,
      currency: currencyId,
      type: 'SPOT',
    },
  })

  if (!wallet) {
    // Generate wallet address
    let addresses
    try {
      addresses = await generateWalletAddressQuery(currencyId)
    } catch (error) {
      logger.error(`Failed to generate wallet address: ${error.message}`)
      throw new Error('Failed to generate wallet address')
    }

    if (!addresses || !Object.keys(addresses).length) {
      throw new Error('Failed to generate wallet address')
    }

    wallet = await createWalletQuery(userId, currencyId, addresses)
  }

  const currency = await prisma.exchange_currency.findUnique({
    where: {
      currency: currencyId,
    },
  })
  if (!currency) throw new Error('Currency not found')

  const newBalance = account.balance - amount

  try {
    const result = await prisma.$transaction([
      prisma.forex_account.update({
        where: { id: account.id },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          uuid: makeUuid(),
          user_id: userId,
          wallet_id: wallet.id,
          type: 'FOREX_WITHDRAW',
          status: 'PENDING',
          amount,
          description: `Withdrawal from forex account ID: ${accountId}`,
          metadata: {
            currency: currency.currency,
            price: currency.price,
          },
        },
      }),
    ])
    return result[1] as unknown as Transaction
  } catch (error) {
    console.error(
      `An error occurred while processing withdrawal for userId: ${userId}, account ID: ${accountId}, amount: ${amount}`,
      error,
    )
    throw error
  }
}
