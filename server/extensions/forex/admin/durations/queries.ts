import type { ForexDuration } from '~~/types' // Please define this type
import { ForexTimeframe } from '~~/types' // Please define this type
import prisma from '~~/utils/prisma'

export async function getForexDurations(): Promise<ForexDuration[]> {
  return (await prisma.forex_duration.findMany({
    include: {
      forex_plan_duration: true,
    },
  })) as unknown as ForexDuration[]
}

export async function getForexDuration(
  id: number,
): Promise<ForexDuration | null> {
  return (await prisma.forex_duration.findUnique({
    where: { id },
    include: {
      forex_plan_duration: true,
    },
  })) as unknown as ForexDuration
}

function isValidTimeframe(timeframe: any): timeframe is ForexTimeframe {
  return Object.values(ForexTimeframe).includes(timeframe as ForexTimeframe)
}

export async function createForexDuration(
  duration: number,
  timeframe: ForexTimeframe,
): Promise<ForexDuration> {
  if (!isValidTimeframe(timeframe)) {
    throw new Error(`Invalid timeframe value: ${timeframe}`)
  }

  return (await prisma.forex_duration.create({
    data: {
      duration,
      timeframe,
    },
  })) as unknown as ForexDuration
}

export async function updateForexDuration(
  id: number,
  duration: number,
  timeframe: ForexTimeframe,
): Promise<ForexDuration> {
  return (await prisma.forex_duration.update({
    where: { id },
    data: {
      duration,
      timeframe,
    },
  })) as unknown as ForexDuration
}

export async function deleteForexDuration(id: number): Promise<void> {
  await prisma.forex_duration.delete({
    where: { id },
  })
}
