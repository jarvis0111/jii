import type { ForexCurrency } from '~~/types' // Please define this type
import { ForexTimeframe } from '~~/types' // Please define this type
import prisma from '~~/utils/prisma'

export async function getForexCurrencies(): Promise<ForexCurrency[]> {
  return (await prisma.forex_currency.findMany(
    {},
  )) as unknown as ForexCurrency[]
}

export async function getForexCurrency(
  id: number,
): Promise<ForexCurrency | null> {
  return (await prisma.forex_currency.findUnique({
    where: { id },
  })) as unknown as ForexCurrency
}

function isValidTimeframe(timeframe: any): timeframe is ForexTimeframe {
  return Object.values(ForexTimeframe).includes(timeframe as ForexTimeframe)
}

export async function createForexCurrency(
  currency: string,
  status: boolean,
): Promise<ForexCurrency> {
  return (await prisma.forex_currency.create({
    data: {
      currency,
      status,
    },
  })) as unknown as ForexCurrency
}

export async function updateForexCurrency(
  id: number,
  currency: string,
  status: boolean,
): Promise<ForexCurrency> {
  return (await prisma.forex_currency.update({
    where: { id },
    data: {
      currency,
      status,
    },
  })) as unknown as ForexCurrency
}

export async function deleteForexCurrency(id: number): Promise<void> {
  await prisma.forex_currency.delete({
    where: { id },
  })
}
