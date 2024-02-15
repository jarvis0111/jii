import type { ForexInvestmentResult, ForexLog } from '~~/types' // Please define these types
import prisma from '~~/utils/prisma'

const forexInvestmentInclude = {
  plan: true,
  duration: true,
  user: {
    select: {
      first_name: true,
      last_name: true,
      uuid: true,
      avatar: true,
    },
  },
}

export async function getForexInvestments(): Promise<ForexLog[]> {
  return (await prisma.forex_investment.findMany({
    include: forexInvestmentInclude,
  })) as unknown as ForexLog[]
}

export async function getForexInvestment(
  uuid: string,
): Promise<ForexLog | null> {
  return (await prisma.forex_investment.findUnique({
    where: { uuid },
    include: forexInvestmentInclude,
  })) as unknown as ForexLog
}

export async function updateForexInvestment(
  uuid: string,
  profit: number,
  result: ForexInvestmentResult,
): Promise<ForexLog> {
  return (await prisma.forex_investment.update({
    where: { uuid },
    data: {
      profit,
      result,
    },
  })) as unknown as ForexLog
}

export async function deleteForexInvestment(id: number): Promise<void> {
  await prisma.forex_investment.delete({
    where: { id },
  })
}
