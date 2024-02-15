import { type ForexPlan } from '~~/types' // Please define this type
import prisma from '~~/utils/prisma'

export async function getForexPlans(): Promise<ForexPlan[]> {
  const plans = await prisma.forex_plan.findMany({
    where: { status: true },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      min_amount: true,
      max_amount: true,
      invested: true,
      trending: true,
      status: true,
      forex_plan_duration: {
        select: {
          duration: {
            select: {
              id: true,
              duration: true,
              timeframe: true,
            },
          },
        },
      },
    },
  })

  return plans as unknown as ForexPlan[]
}
