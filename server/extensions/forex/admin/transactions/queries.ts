import type { ForexLog, Transaction } from '~~/types' // Please define these types
import { sendForexTransactionEmail } from '~~/utils/emails'
import prisma from '~~/utils/prisma'

const forexTransactionInclude = {
  wallet: {
    select: {
      uuid: true,
      currency: true,
    },
  },
  user: {
    select: {
      first_name: true,
      last_name: true,
      uuid: true,
      avatar: true,
    },
  },
}

export async function getForexTransactions(): Promise<ForexLog[]> {
  return (await prisma.transaction.findMany({
    where: {
      type: {
        in: ['FOREX_DEPOSIT', 'FOREX_WITHDRAW'],
      },
    },
    include: forexTransactionInclude,
  })) as unknown as ForexLog[]
}

export async function getForexTransaction(
  uuid: string,
): Promise<ForexLog | null> {
  return (await prisma.transaction.findUnique({
    where: {
      uuid,
      type: {
        in: ['FOREX_DEPOSIT', 'FOREX_WITHDRAW'],
      },
    },
    include: forexTransactionInclude,
  })) as unknown as ForexLog
}

export async function updateTransactionStatusQuery(
  referenceId: string,
  status: string,
  message?: string,
): Promise<Transaction> {
  // Fetch the transaction
  const transaction = (await prisma.transaction.findUnique({
    where: { uuid: referenceId },
  })) as any
  if (!transaction) throw new Error('Transaction not found')

  const updateData: any = {
    status,
    metadata: transaction.metadata,
  }

  // Fetch the forex account
  const account = await prisma.forex_account.findFirst({
    where: { user_id: transaction.user_id, type: 'LIVE' },
  })
  if (!account) throw new Error('Account not found')
  if (!transaction.metadata?.price) throw new Error('Price not found')

  let balance = Number(account.balance)
  const cost = Number(transaction.amount) * Number(transaction.metadata?.price)

  // Fetch the wallet
  const wallet = await prisma.wallet.findUnique({
    where: { id: transaction.wallet_id },
  })
  if (!wallet) throw new Error('Wallet not found')

  let walletBalance = Number(wallet.balance)

  if (status === 'REJECTED') {
    if (message) {
      updateData.metadata.note = message
    }
    // Reverse the transaction
    if (transaction.type === 'FOREX_WITHDRAW') {
      balance += cost
    } else if (transaction.type === 'FOREX_DEPOSIT') {
      walletBalance += cost
    }
  } else if (status === 'COMPLETED') {
    // Complete the transaction
    if (transaction.type === 'FOREX_DEPOSIT') {
      balance += cost
    } else if (transaction.type === 'FOREX_WITHDRAW') {
      walletBalance += cost
    }
  }

  // Update wallet if necessary
  if (walletBalance !== wallet.balance) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: walletBalance },
    })
  }

  // Update forex account if necessary
  if (balance !== account.balance) {
    await prisma.forex_account.update({
      where: { id: account.id },
      data: { balance },
    })
  }

  const updatedTransaction = (await prisma.transaction.update({
    where: { uuid: referenceId },
    data: updateData,
  })) as unknown as Transaction

  // Fetch user information for email
  const user = await prisma.user.findUnique({
    where: { id: transaction.user_id },
  })

  if (user) {
    // Send an email notification about the transaction status update
    await sendForexTransactionEmail(
      user,
      updatedTransaction,
      transaction.type as 'FOREX_DEPOSIT' | 'FOREX_WITHDRAW',
    )
  }

  return updatedTransaction
}
