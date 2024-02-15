import type { ForexSignal, ForexSignalStatus } from '~~/types' // Please define this type
import { ForexTimeframe } from '~~/types' // Please define this type
import prisma from '~~/utils/prisma'

export async function getForexSignals(): Promise<ForexSignal[]> {
  return (await prisma.forex_signal.findMany({
    include: {
      forex_accounts: true,
    },
  })) as unknown as ForexSignal[]
}

export async function getForexSignal(id: number): Promise<ForexSignal | null> {
  return (await prisma.forex_signal.findUnique({
    where: { id },
    include: {
      forex_accounts: true,
    },
  })) as unknown as ForexSignal
}

function isValidTimeframe(timeframe: any): timeframe is ForexTimeframe {
  return Object.values(ForexTimeframe).includes(timeframe as ForexTimeframe)
}

export async function createForexSignal(
  title: string,
  image: string,
  status: ForexSignalStatus,
): Promise<ForexSignal> {
  return (await prisma.forex_signal.create({
    data: {
      title,
      image,
      status,
    },
  })) as unknown as ForexSignal
}

export async function updateForexSignal(
  id: number,
  title: string,
  image: string,
  status: ForexSignalStatus,
): Promise<ForexSignal> {
  return (await prisma.forex_signal.update({
    where: { id },
    data: {
      title,
      image,
      status,
    },
  })) as unknown as ForexSignal
}

export async function deleteForexSignal(id: number): Promise<void> {
  await prisma.forex_signal.delete({
    where: { id },
  })
}
