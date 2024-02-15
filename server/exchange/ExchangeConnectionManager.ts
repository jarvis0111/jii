/* eslint-disable prettier-vue/prettier */
import { createLogger } from '../logger'
import ExchangeManager from '../utils/exchange'
import prisma from '../utils/prisma'
import type ClientConnectionManager from './ClientConnectionManager'
import type ClientHandler from './ClientHandler'
import type { SubscriptionType } from './ClientHandler'
const logger = createLogger('Exchange')

interface Subscription {
  isActive: boolean
  interval: string | null
  limit: number | null
  param: any
}

export default class ExchangeConnectionManager {
  private static instance: ExchangeConnectionManager | null = null
  private clientConnectionManager: ClientConnectionManager
  private subscriptions: Map<string, Subscription> = new Map()
  private messageBuffer: { [key: string]: any } = {}
  private exchange: any
  private provider: string

  static getInstance(
    clientConnectionManager: ClientConnectionManager,
  ): ExchangeConnectionManager {
    if (!this.instance) {
      this.instance = new ExchangeConnectionManager(clientConnectionManager)
    }
    return this.instance
  }

  private constructor(clientConnectionManager: ClientConnectionManager) {
    this.clientConnectionManager = clientConnectionManager
    this.subscriptions = new Map()
    this.initializeExchangeInstance().catch((err) =>
      logger.error('Error initializing exchange:', err),
    )
    this.messageBuffer = {}
  }

  private async initializeExchangeInstance(): Promise<void> {
    if (!this.exchange) {
      this.exchange = await (ExchangeManager as any).startExchange()
      this.provider = await (ExchangeManager as any).provider
    }
  }

  async watchData(
    symbol: string,
    type: SubscriptionType,
    interval: string,
    limit: number,
    param: any,
  ) {
    if (!this.exchange) {
      await this.initializeExchangeInstance()
    }
    if (!this.exchange) {
      logger.info('Exchange failed to initialize')
      return
    }
    if (!this.exchange.has[type]) {
      logger.info(`Endpoint ${type} is not available`)
      return
    }

    const subscriptionKey =
      (type as string) === 'watchOHLCV' ? `${symbol}-${interval}` : symbol
    const subscription = this.getSubscription(subscriptionKey, type)
    subscription.isActive = true
    subscription.interval = interval
    subscription.limit = limit
    subscription.param = param

    const fetchData = {
      watchTicker: async () => await this.exchange.watchTicker(symbol),
      watchOHLCV: async () =>
        await this.exchange.watchOHLCV(symbol, interval, undefined, limit),
      watchTrades: async () =>
        await this.exchange.watchTrades(symbol, undefined, limit),
      watchOrderBook: async () =>
        await this.exchange.watchOrderBook(symbol, limit),
    }

    if (!fetchData[type]) {
      logger.info(`Unsupported type: ${type}`)
      return
    }

    while (subscription.isActive) {
      try {
        const data = await fetchData[type]()

        // Add the data to the buffer
        this.messageBuffer[type] = this.messageBuffer[type] || {}
        this.messageBuffer[type][subscriptionKey] = data

        await this.exchange.sleep(100)
      } catch (error) {
        logger.error(`Error fetching ${type}: ${error.message}`)
        subscription.isActive = false
      }
    }
  }

  collectClientData(clientHandler: ClientHandler) {
    const clientData = {}

    for (const type in clientHandler.subscriptions) {
      for (const key of clientHandler.subscriptions[type]) {
        if (this.messageBuffer[type] && this.messageBuffer[type][key]) {
          clientData[type] = clientData[type] || {}
          clientData[type] = this.messageBuffer[type][key]
        }
      }
    }

    return clientData
  }

  getSubscription(identifier: string, type: string) {
    const key = `${identifier}-${type}`
    let subscription = this.subscriptions.get(key)
    if (!subscription) {
      subscription = {
        isActive: false,
        interval: null,
        limit: null,
        param: null,
      }
      this.subscriptions.set(key, subscription)
    }
    return subscription
  }

  removeSubscription(identifier: string, type: string) {
    const key = `${identifier}-${type}`
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      subscription.isActive = false
      this.subscriptions.delete(key)
    }
  }

  async getLatestTickers() {
    return this.messageBuffer['watchAllTickers'] || {}
  }

  async validateConnection() {
    try {
      const time = await this.exchange.fetchTime()
      return true
    } catch (error) {
      return false
    }
  }

  reconnect() {
    let retries = 0
    const maxRetries = 5

    const attemptReconnect = () => {
      if (retries >= maxRetries) {
        logger.error('Max retries reached. Reconnection failed.')
        return
      }

      try {
        this.exchange.close()
      } catch (error) {}
      this.initializeExchangeInstance().catch((err) =>
        logger.error('Error initializing exchange:', err),
      )

      // Re-subscribe to active subscriptions
      for (const [key, subscription] of this.subscriptions) {
        if (subscription.isActive) {
          if (key === 'watchAllTickers') {
            this.watchAllTickers()
          } else {
            const [symbol, type] = key.split('-')
            this.watchData(
              symbol,
              type as SubscriptionType,
              subscription.interval,
              subscription.limit,
              subscription.param,
            )
          }
        }
      }

      // Increment retries and set a delay for the next attempt
      retries++
      const delay = Math.pow(2, retries) * 1000 // Exponential backoff
      setTimeout(async () => {
        const validation = await this.validateConnection()
        if (!validation) {
          logger.info('Reconnection failed, Trying again...')
          attemptReconnect()
        }
      }, delay)
    }

    // Start the reconnection attempts
    attemptReconnect()
  }

  flushBuffer() {
    setInterval(async () => {
      const tradeClients =
        this.clientConnectionManager.getClientsOfType('trade')
      const closedClients = new Set<string>() // Use Set for performance optimization

      for (const clientHandler of tradeClients) {
        if (clientHandler.connectionState !== 'OPEN') {
          this.clientConnectionManager.removeClient(clientHandler.id.toString())
          logger.info(
            `Client ${clientHandler.id} removed due to closed WebSocket.`,
          )
          continue
        }

        const clientData = this.collectClientData(clientHandler)
        if (Object.keys(clientData).length > 0) {
          try {
            clientHandler.ws.send(JSON.stringify(clientData))
          } catch (error) {
            logger.error(
              `Error sending data to client ${clientHandler.id}: ${error.message}`,
            )
            closedClients.add(clientHandler.id.toString()) // Use Set.add for better performance
            logger.info(`Client ${clientHandler.id} removed due to send error.`)
          }
        }
      }

      // Remove closed clients
      closedClients.forEach((clientId) => {
        this.clientConnectionManager.removeClient(clientId)
        logger.info('Client removed in flushBuffer', clientId)
      })

      this.messageBuffer = {} // Reset the message buffer
    }, 250) // Flush the buffer every 250ms
  }

  async watchAllTickers() {
    const subscriptionKey = 'watchAllTickers'
    const subscription = this.getSubscription(subscriptionKey, 'tickers')
    subscription.isActive = true

    const marketsInDB = (await prisma.exchange_market.findMany({
      where: {
        status: true,
      },
    })) as any
    const symbolsInDB = marketsInDB.map((market) => market.symbol)

    while (subscription.isActive) {
      try {
        let allTickers: any
        if (
          this.exchange &&
          this.exchange.has['watchTickers'] &&
          this.provider !== 'kucoin'
        ) {
          allTickers = await this.exchange.watchTickers(symbolsInDB)
        } else {
          allTickers = await this.exchange.fetchTickers(symbolsInDB)
        }

        if (Array.isArray(allTickers)) {
          const normalizedTickers = {}
          for (const ticker of allTickers) {
            if (ticker && ticker.symbol) {
              normalizedTickers[ticker.symbol] = ticker
            }
          }
          allTickers = normalizedTickers
        }

        // Filtering process
        const filteredTickers = {}
        for (const symbol of symbolsInDB) {
          if (allTickers[symbol]) {
            filteredTickers[symbol] = {
              last: allTickers[symbol].last,
              baseVolume: allTickers[symbol].baseVolume,
              quoteVolume: allTickers[symbol].quoteVolume,
              change: allTickers[symbol].percentage,
            }
          }
        }

        const clients = this.clientConnectionManager.getClientsOfType('tickers')
        const closedClients: string[] = []

        for (const clientHandler of clients) {
          if (clientHandler.connectionState === 'OPEN') {
            const payload = { watchTickers: filteredTickers }
            clientHandler.ws.send(JSON.stringify(payload))
          } else {
            logger.info(
              `WebSocket is not open for client ${clientHandler.id}, removing client.`,
            )
            closedClients.push(clientHandler.id.toString())
          }
        }

        // Remove closed clients
        for (const clientId of closedClients) {
          this.clientConnectionManager.removeClient(clientId)
          logger.info('Client removed in watchTickers', clientId)
        }

        if (this.exchange.has['watchTickers']) {
          await new Promise((resolve) => setTimeout(resolve, 250))
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        // logger.error('Error fetching tickers ', error.message)

        if (this.provider === 'binance') {
          const err = error as any // Typecast to any to allow custom properties
          if (
            err.message.includes(
              'Invalid API-key, IP, or permissions for action.',
            )
          ) {
            logger.error(
              'Invalid Binance credentials. Waiting for 1 hour before retrying or until credentials are updated and server is restarted.',
            )
            await new Promise((resolve) => setTimeout(resolve, 60 * 5 * 1000)) // Wait for 1 hour
            await this.resetExchangeInstance()
            continue
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 5000)) // General error, wait for 5 seconds
        await this.resetExchangeInstance()
        continue
      }
    }
  }

  async resetExchangeInstance() {
    if (this.provider) {
      ExchangeManager.removeExchange(this.provider)
    }
    await this.initializeExchangeInstance()
  }
}
