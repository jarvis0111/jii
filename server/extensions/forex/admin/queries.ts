import { convertAndSortCounts } from '~~/utils/analytics'
import prisma from '~~/utils/prisma'

export async function getForexCountsPerDay() {
  // Get the current date and subtract 30 days to get the start date
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const forexAccounts = (await prisma.forex_account.findMany({
    where: {
      created_at: {
        gte: startDate,
      },
    },
    select: {
      created_at: true,
      status: true,
    },
  })) as any[]

  const forexPlans = (await prisma.forex_plan.findMany({
    where: {
      created_at: {
        gte: startDate,
      },
    },
    select: {
      created_at: true,
      status: true,
    },
  })) as any[]

  // Fetch all AI trading data created within the last 30 days
  const forexInvestments = (await prisma.forex_investment.findMany({
    where: {
      created_at: {
        gte: startDate,
      },
    },
    select: {
      created_at: true,
      status: true,
      result: true,
      plan: {
        select: {
          invested: true,
        },
      },
    },
  })) as any[]

  // Initialize the counts object
  const counts = {
    totalForexAccounts: {},
    activeForexAccounts: {},
    totalForexPlans: {},
    activeForexPlans: {},
    totalForexInvestments: {},
    activeForexInvestments: {},
    completedForexInvestments: {},
    totalInvestedInForex: {},
    totalProfitFromForex: {},
  }

  // Populate counts
  forexAccounts.forEach((forexAccount) => {
    const date = forexAccount.created_at.toISOString().split('T')[0]

    // Increment total AI plans count
    counts.totalForexAccounts[date] = (counts.totalForexAccounts[date] || 0) + 1

    // Increment active AI plans count
    if (forexAccount.status === 'ACTIVE') {
      counts.activeForexAccounts[date] =
        (counts.activeForexAccounts[date] || 0) + 1
    }
  })

  forexPlans.forEach((forexPlan) => {
    const date = forexPlan.created_at.toISOString().split('T')[0]

    // Increment total AI plans count
    counts.totalForexPlans[date] = (counts.totalForexPlans[date] || 0) + 1

    // Increment active AI plans count
    if (forexPlan.status === 'ACTIVE') {
      counts.activeForexPlans[date] = (counts.activeForexPlans[date] || 0) + 1
    }
  })

  forexInvestments.forEach((forexInvestment) => {
    const date = forexInvestment.created_at.toISOString().split('T')[0]

    // Increment total AI plans count
    counts.totalForexInvestments[date] =
      (counts.totalForexInvestments[date] || 0) + 1

    // Increment active AI plans count
    if (forexInvestment.status === 'ACTIVE') {
      counts.activeForexInvestments[date] =
        (counts.activeForexInvestments[date] || 0) + 1
    }

    // Increment completed AI trades count
    if (forexInvestment.status === 'COMPLETED') {
      counts.completedForexInvestments[date] =
        (counts.completedForexInvestments[date] || 0) + 1
    }

    // Increment total invested in AI trading
    counts.totalInvestedInForex[date] =
      (counts.totalInvestedInForex[date] || 0) + forexInvestment.plan.invested

    // Increment total profit from AI trading
    if (
      forexInvestment.result === 'WIN' &&
      forexInvestment.status === 'COMPLETED'
    ) {
      counts.totalProfitFromForex[date] =
        (counts.totalProfitFromForex[date] || 0) + forexInvestment.plan.invested
    }
  })

  // Convert counts to arrays and sort by date
  const result = {
    totalForexAccounts: convertAndSortCounts(counts.totalForexAccounts),
    activeForexAccounts: convertAndSortCounts(counts.activeForexAccounts),
    totalForexPlans: convertAndSortCounts(counts.totalForexPlans),
    activeForexPlans: convertAndSortCounts(counts.activeForexPlans),
    totalForexInvestments: convertAndSortCounts(counts.totalForexInvestments),
    activeForexInvestments: convertAndSortCounts(counts.activeForexInvestments),
    completedForexInvestments: convertAndSortCounts(
      counts.completedForexInvestments,
    ),
    totalInvestedInForex: convertAndSortCounts(counts.totalInvestedInForex),
    totalProfitFromForex: convertAndSortCounts(counts.totalProfitFromForex),
  }

  return result
}
