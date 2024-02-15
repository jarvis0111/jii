import type { ForexInvestmentResult, ForexPlan } from '~~/types' // Please define these types
import prisma from '~~/utils/prisma'

export async function getForexPlans(): Promise<ForexPlan[]> {
  return (await prisma.forex_plan.findMany({
    include: {
      forex_plan_duration: true,
    },
  })) as unknown as ForexPlan[]
}

export async function getForexPlan(id: number): Promise<ForexPlan | null> {
  return (await prisma.forex_plan.findUnique({
    where: { id },
    include: {
      forex_plan_duration: true,
    },
  })) as unknown as ForexPlan
}

export async function createForexPlan(
  name: string,
  title: string,
  description: string,
  min_amount: number,
  max_amount: number,
  profit_percentage: number,
  min_profit: number,
  max_profit: number,
  default_profit: number,
  default_result: ForexInvestmentResult,
  durations: number[],
  invested?: number,
  status?: boolean,
  image?: string,
  trending?: boolean,
): Promise<ForexPlan> {
  const plan = await prisma.forex_plan.create({
    data: {
      name,
      title,
      description,
      min_amount,
      max_amount,
      invested,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      status,
      image,
      trending,
    },
  })

  await syncDurations(plan.id, durations)

  return plan as unknown as ForexPlan
}

export async function updateForexPlan(
  id: number,
  name: string,
  title: string,
  description: string,
  min_amount: number,
  max_amount: number,
  profit_percentage: number,
  min_profit: number,
  max_profit: number,
  default_profit: number,
  default_result: ForexInvestmentResult,
  durations: number[],
  invested?: number,
  status?: boolean,
  image?: string,
  trending?: boolean,
): Promise<ForexPlan> {
  const plan = await prisma.forex_plan.update({
    where: { id },
    data: {
      name,
      title,
      description,
      min_amount,
      max_amount,
      invested,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      status,
      image,
      trending,
    },
  })

  await syncDurations(id, durations)

  return plan as unknown as ForexPlan
}

export async function deleteForexPlan(id: number): Promise<void> {
  await prisma.forex_plan.delete({
    where: { id },
  })
}

export async function syncDurations(
  planId: number,
  durations: number[],
): Promise<ForexPlan> {
  const plan = await prisma.forex_plan.findUnique({
    where: { id: planId },
    include: { forex_plan_duration: true },
  })

  if (!plan) throw new Error('Forex plan not found')

  const existingDurationIds = plan.forex_plan_duration.map(
    (dp) => dp.duration_id,
  )

  const toBeAdded = durations.filter((id) => !existingDurationIds.includes(id))
  const toBeRemoved = existingDurationIds.filter(
    (id) => !durations.includes(id),
  )

  if (toBeRemoved.length > 0) {
    await prisma.forex_plan_duration.deleteMany({
      where: {
        plan_id: planId,
        duration_id: { in: toBeRemoved },
      },
    })
  }

  if (toBeAdded.length > 0) {
    await prisma.forex_plan.update({
      where: { id: planId },
      data: {
        forex_plan_duration: {
          create: toBeAdded.map((durationId) => ({
            duration_id: durationId,
          })),
        },
      },
    })
  }

  const updatedPlan = await getForexPlan(planId)
  return updatedPlan as unknown as ForexPlan
}
