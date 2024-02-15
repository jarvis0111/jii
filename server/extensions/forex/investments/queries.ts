import { addDays, addHours, isPast } from 'date-fns'
import { processRewards } from '~~/utils/affiliate'
import { createLogger } from '../../../logger'
import type { ForexAccount, ForexDuration } from '../../../types'
import {
  ForexLogStatus,
  type ForexLog,
  type ForexPlan,
  type User,
} from '../../../types'
import { sendForexInvestmentEmail } from '../../../utils/emails'
import { makeUuid } from '../../../utils/passwords'
import prisma from '../../../utils/prisma'
// Constants
const ONE_HOUR = 3600 * 1000
const logger = createLogger('Forex Investments')

const investmentInclude = {
  plan: {
    select: {
      id: true,
      name: true,
      title: true,
      description: true,
      profit_percentage: true,
      image: true,
    },
  },
  user: {
    select: {
      id: true,
      uuid: true,
      avatar: true,
      first_name: true,
      last_name: true,
    },
  },
  duration: {
    select: {
      id: true,
      duration: true,
      timeframe: true,
    },
  },
}

export async function getInvestments(userId: number): Promise<ForexLog[]> {
  return (await prisma.forex_investment.findMany({
    where: {
      user_id: userId,
    },
    include: investmentInclude,
  })) as unknown as ForexLog[]
}
export async function getUserActiveInvestments(
  userId: number,
): Promise<ForexLog> {
  return (await prisma.forex_investment.findFirst({
    where: {
      user_id: userId,
      status: 'ACTIVE',
    },
    include: investmentInclude,
  })) as unknown as ForexLog
}

export async function getActiveInvestments(): Promise<ForexLog[]> {
  return (await prisma.forex_investment.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          default_profit: true,
          default_result: true,
        },
      },
      duration: {
        select: {
          id: true,
          duration: true,
          timeframe: true,
        },
      },
    },
  })) as unknown as ForexLog[]
}

export async function getInvestment(id: number): Promise<ForexLog | null> {
  return (await prisma.forex_investment.findUnique({
    where: { id },
    include: investmentInclude,
  })) as unknown as ForexLog
}

export async function createInvestment(
  userId: number,
  accountId: string,
  planId: number,
  durationId: number,
  amount: number,
): Promise<ForexLog> {
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })) as unknown as User
  if (!user) {
    throw new Error('User not found')
  }
  const plan = (await prisma.forex_plan.findUnique({
    where: {
      id: planId,
    },
  })) as unknown as ForexPlan
  if (!plan) {
    throw new Error('Plan not found')
  }
  if (amount < plan.min_amount || amount > plan.max_amount) {
    throw new Error('Amount is not within plan limits')
  }
  const account = (await prisma.forex_account.findFirst({
    where: {
      user_id: userId,
      account_id: accountId,
    },
  })) as unknown as ForexAccount
  if (!account) {
    throw new Error('Account not found')
  }
  if (account.balance < amount) {
    throw new Error('Insufficient balance')
  }
  const duration = (await prisma.forex_duration.findUnique({
    where: {
      id: durationId,
    },
  })) as unknown as ForexDuration
  if (!duration) {
    throw new Error('Duration not found')
  }
  const endDate = new Date() // Initialize with current date and time

  switch (duration.timeframe) {
    case 'HOUR':
      endDate.setHours(endDate.getHours() + duration.duration)
      break
    case 'DAY':
      endDate.setDate(endDate.getDate() + duration.duration)
      break
    case 'WEEK':
      endDate.setDate(endDate.getDate() + 7 * duration.duration) // 7 days in a week
      break
    case 'MONTH':
      endDate.setDate(endDate.getDate() + 30 * duration.duration) // 30 days in a month
      break
    default:
      throw new Error('Invalid timeframe')
  }

  const investment = (await prisma.forex_investment.create({
    data: {
      uuid: makeUuid(),
      user_id: userId,
      plan_id: planId,
      amount: amount,
      status: ForexLogStatus.ACTIVE,
      duration_id: duration.id,
      end_date: endDate,
    } as any,
    include: investmentInclude,
  })) as unknown as ForexLog

  // Update account balance
  await prisma.forex_account.update({
    where: {
      id: account.id,
    },
    data: {
      balance: account.balance - amount,
    },
  })

  await sendForexInvestmentEmail(user, investment, 'NewForexInvestmentCreated')

  return investment
}

export async function cancelInvestment(
  userId: number,
  investmentUuid: string,
): Promise<void> {
  // Find the investment by UUID and user_id
  const investment = (await prisma.forex_investment.findFirst({
    where: {
      uuid: investmentUuid,
      user_id: userId,
    },
    include: investmentInclude,
  })) as unknown as ForexLog

  if (!investment) {
    throw new Error('Investment not found or does not belong to the user')
  }

  // Handle refunds here, update user's account balance, etc.
  const account = (await prisma.forex_account.findFirst({
    where: {
      user_id: userId,
      type: 'LIVE',
    },
  })) as unknown as ForexAccount

  if (!account) {
    throw new Error('Account not found')
  }

  // Optional: Check if the investment can be cancelled (based on your business rules)
  const currentDate = new Date()
  const investmentCreatedAt = new Date(investment.created_at)
  const timeSinceInvestment =
    currentDate.getTime() - investmentCreatedAt.getTime()

  if (timeSinceInvestment > ONE_HOUR) {
    // Replace with your own criteria
    throw new Error('Investment cannot be cancelled after 1 hour')
  }

  // Update the investment status to 'CANCELLED'
  await prisma.forex_investment.update({
    where: {
      uuid: investmentUuid,
    },
    data: {
      status: ForexLogStatus.CANCELLED,
    },
  })

  // Update the account balance
  await prisma.forex_account.update({
    where: {
      id: account.id,
    },
    data: {
      balance: account.balance + investment.amount,
    },
  })

  // Send cancellation email
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })) as unknown as User

  await sendForexInvestmentEmail(user, investment, 'ForexInvestmentCanceled')
}

export async function checkInvestment(uuid: string): Promise<ForexLog | null> {
  const investment = (await prisma.forex_investment.findUnique({
    where: { uuid },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          default_profit: true,
          default_result: true,
        },
      },
      duration: {
        select: {
          id: true,
          duration: true,
          timeframe: true,
        },
      },
    },
  })) as unknown as ForexLog
  if (!investment) {
    throw new Error('Investment not found')
  }
  return await processForexInvestment(investment)
}

export async function processForexInvestments() {
  const activeInvestments = await getActiveInvestments()

  for (const investment of activeInvestments) {
    try {
      await processForexInvestment(investment)
    } catch (error) {
      continue
    }
  }
}

export async function processForexInvestment(
  investment: ForexLog,
): Promise<ForexLog | null> {
  const { id, duration, created_at, amount, profit, result, plan, user_id } =
    investment
  const roi = profit || plan.default_profit
  const investment_result = result || plan.default_result

  let endDate
  switch (duration.timeframe) {
    case 'HOUR':
      endDate = addHours(new Date(created_at), duration.duration)
      break
    case 'DAY':
      endDate = addDays(new Date(created_at), duration.duration)
      break
    case 'WEEK':
      endDate = addDays(new Date(created_at), duration.duration * 7)
      break
    case 'MONTH':
      endDate = addDays(new Date(created_at), duration.duration * 30)
      break
    default:
      endDate = addHours(new Date(created_at), duration.duration)
      break
  }

  if (isPast(endDate)) {
    let updatedForexInvestment
    try {
      const account = await prisma.forex_account.findFirst({
        where: {
          user_id: user_id,
          type: 'LIVE',
        },
      })
      if (!account) throw new Error('Account not found')

      const newBalance =
        account.balance +
        (investment_result === 'WIN'
          ? roi
          : investment_result === 'LOSS'
            ? -roi
            : 0)

      // Update Balance
      updatedForexInvestment = await prisma.$transaction(async (prisma) => {
        await prisma.forex_account.update({
          where: { id: account.id },
          data: { balance: newBalance },
        })

        const updatedForexLog = await prisma.forex_investment.update({
          where: { id },
          data: {
            status: ForexLogStatus.COMPLETED,
            result: investment_result,
            profit: roi,
          },
          include: investmentInclude,
        })

        return updatedForexLog // Return the updated investment log
      })
    } catch (error) {
      logger.error(`Error processing investment: ${error}`)
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    })
    if (updatedForexInvestment) {
      try {
        await sendForexInvestmentEmail(
          user,
          updatedForexInvestment,
          'ForexInvestmentCompleted',
        )
      } catch (error) {
        logger.error(`Error sending email: ${error}`)
      }

      try {
        await processRewards(
          user.uuid,
          amount,
          'FOREX_INVESTMENT',
          investment?.currency,
        )
      } catch (error) {
        logger.error(`Error processing rewards: ${error.message}`)
      }
    }
    return updatedForexInvestment
  }
}
