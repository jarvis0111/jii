import type { ForexAccount } from '~~/types' // Please define this type
import prisma from '~~/utils/prisma'

export async function getForexAccounts(): Promise<ForexAccount[]> {
  return (await prisma.forex_account.findMany({
    include: {
      user: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
    },
  })) as unknown as ForexAccount[]
}

export async function getForexAccount(
  id: number,
): Promise<ForexAccount | null> {
  return (await prisma.forex_account.findUnique({
    where: { id },
  })) as unknown as ForexAccount
}

export async function createForexAccount(
  account_id: string,
  password: string,
  mt: number,
  broker: string,
  type: 'LIVE' | 'DEMO',
  status: boolean,
  balance: number,
  leverage: number,
): Promise<ForexAccount> {
  return (await prisma.forex_account.create({
    data: {
      account_id,
      password,
      mt,
      broker,
      type,
      status,
      balance,
      leverage,
    },
  })) as unknown as ForexAccount
}

export async function updateForexAccount(
  id: number,
  account_id: string,
  password: string,
  mt: number,
  broker: string,
  type: 'LIVE' | 'DEMO',
  status: boolean,
  balance: number,
  leverage: number,
): Promise<ForexAccount> {
  return (await prisma.forex_account.update({
    where: { id },
    data: {
      account_id,
      password,
      mt,
      broker,
      type,
      status,
      balance,
      leverage,
    },
  })) as unknown as ForexAccount
}

export async function deleteForexAccount(id: number): Promise<void> {
  await prisma.forex_account.delete({
    where: { id },
  })
}
