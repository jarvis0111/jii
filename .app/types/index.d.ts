export interface User {
  id: number
  uuid: string
  email: string
  password: string
  avatar?: string
  first_name: string
  last_name: string
  email_verified?: boolean
  is_active?: boolean
  last_login?: Date
  phone?: string
  created_at: Date
  deleted_at?: Date
  updated_at?: Date
  role_id: number
  metadata?: JSON
  notifications?: JSON
  status?: UserStatus
  role: Role
  twofactor?: TwoFactor
  author?: Author
  chats: Chat[]
  notification: Notification[]
  posts: Post[]
  comments: Comment[]
}

export interface CustomWebSocket {
  send: (
    message: string | ArrayBuffer,
    isBinary?: boolean,
    compress?: boolean,
  ) => void
  end: (data: any) => void
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED'

export interface UserMetadata {
  role: string
  bio: string
  location: {
    address: string
    city: string
    country: string
    zip: string
  }
  social: {
    facebook: string
    twitter: string
    dribbble: string
    instagram: string
    github: string
    gitlab: string
  }
  info: {
    experience: string
    firstJob: { label: string; value: boolean }
    flexible: { label: string; value: boolean }
    remote: { label: string; value: boolean }
  }
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
  rolePermissions: RolePermission[]
}

export interface Permission {
  id: number
  name: string
  rolePermissions: RolePermission[]
}

export interface RolePermission {
  id: number
  role: Role
  permission: Permission
}

export interface ProviderUser {
  id: number
  provider: 'GOOGLE'
  provider_user_id: string
  user_id: number
}

export interface JSONResponse {
  status: 'success' | 'fail'
  data?: any
  error?: any
}

export interface TokensSession {
  accessToken: string
  refreshToken: string
  sid?: string
}

export type ClientPlatforms = 'app' | 'browser' | 'browser-dev'

export interface EmailOptions {
  to: string
  from: string
  subject: string
  text?: string
  html?: string
}

export interface UserEditable {
  first_name?: string
  last_name?: string
  csrf_token?: string
  is_active?: boolean
}

export interface NewUser {
  first_name: string
  last_name: string
  email: string
  password: string
  role_id: number
  csrf_token?: string
}

export interface RefreshToken {
  id: number
  token_id: string
  user_id: number
  is_active: boolean
  date_created: Date
}

export type RefreshTokens = Array<RefreshToken>

export interface Session {
  id: number
  user_id: number
  sid: string
  access_token: string
  csrf_token: string
  is_active: boolean
  ip_address: string
}

export interface Notification {
  id: number
  user_id: number
  type: string | null
  title: string
  message: string
  link: string | null
  created_at: Date | null
  updated_at: Date | null
}

export interface Wallet {
  id: number
  uuid: string
  type: WalletType
  user_id: number
  balance: number
  inOrder: number
  currency: string
  addresses: any
  created_at: string
  updated_at: string
  transactions: Transaction[]
  invoices: Invoice[]
}

export enum WalletType {
  FIAT = 'FIAT',
  SPOT = 'SPOT',
  ECO = 'ECO',
}

// Types for WalletData model
export interface WalletData {
  id: number
  wallet_id?: number
  currency: string
  chain: string
  data: any
  index
}

// Types for EcosystemMasterWallet model
export type MasterWalletStatus = 'ACTIVE' | 'INACTIVE'

export interface EcosystemMasterWallet {
  id: number
  uuid: string
  chain: string
  currency: string
  address: string
  data: any
  status: MasterWalletStatus
  last_index?: number
  balance?: number
}

export interface Web3WalletData {
  address: string
  chain: string
  data: string
}

export interface EcosystemToken {
  id: number
  name: string
  currency: string
  chain: string
  network?: string
  type: string
  contract: string
  decimals: number
  status?: boolean
  precision?: EcosystemPrecision
  limits?: EcosystemTokenLimits
  fees?: any
  contractType?: EcosystemTokenContractType
  created_at: Date
}

export enum EcosystemTokenContractType {
  PERMIT = 'PERMIT',
  NO_PERMIT = 'NO_PERMIT',
  NATIVE = 'NATIVE',
}

export type EcosystemPrecision = {
  amount: number
  price: number
}

export type EcosystemTokenLimits = {
  deposit: {
    min: number
    max: number
  }
  withdraw: {
    min: number
    max: number
  }
}

export enum TransactionType {
  FAILED = 'FAILED',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  OUTGOING_TRANSFER = 'OUTGOING_TRANSFER',
  INCOMING_TRANSFER = 'INCOMING_TRANSFER',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  BINARY_ORDER = 'BINARY_ORDER',
  EXCHANGE_ORDER = 'EXCHANGE_ORDER',
  INVESTMENT = 'INVESTMENT',
  INVESTMENT_ROI = 'INVESTMENT_ROI',
  INVOICE = 'INVOICE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  TIMEOUT = 'TIMEOUT',
}

// The Transaction type maps to your Prisma model for transactions
export interface Transaction {
  id: number
  uuid: string
  user_id: number
  wallet_id: number
  type: TransactionType
  status: TransactionStatus
  amount: number
  fee?: number
  description?: string
  metadata?: any // Replace with a more specific type if you know the shape of the metadata
  reference_id?: string
  created_at: Date
  updated_at?: Date
  wallet: Wallet
  user: User
  invoice: Invoice
}

export interface Invoice {
  id: number
  wallet_id: number
  user_id: number
  amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface TwoFactor {
  id: number
  user_id: number
  secret: string
  type: TwoFactorType
  created_at: string
  updated_at: string
}

export type TwoFactorType = 'EMAIL' | 'SMS' | 'APP'

export interface Author {
  id: number
  uuid: string
  user_id: number
  status: AuthorStatus
  user: User
  posts: Post[]
}

export type AuthorStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Category {
  id: number
  name: string
  slug: string
  created_at: Date | null
  updated_at: Date | null
  post: Post[]
}

export interface Comment {
  id: number
  content: string
  author_id: number
  author: Author
  post_id: number
  post: Post
  created_at: Date | null
  updated_at: Date | null
}

export interface PostTag {
  id: number
  post_id: number
  tag_id: number
  created_at: Date | null
  updated_at: Date | null
}

export interface Post {
  id: number
  title: string
  content: string
  category_id: number
  author_id: number
  author: Author
  created_at: Date | null
  updated_at: Date | null
  comment: Comment[]
  post_tag: PostTag[]
  status: PostStatus
}

export type PostStatus = 'PUBLISHED' | 'DRAFT' | 'TRASH'

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: Date | null
  updated_at: Date | null
  post_tag: PostTag[]
}

export interface Settings {
  key: string
  value: string
  updated_at: Date | null
}

export type ExchangeType = 'kucoin' | 'binance'

export interface Exchange {
  id: number
  name: string
  title: string
  status: boolean | null
  username: string | null
  licenseStatus: boolean | null
  version: string | null
  productId: string | null
  type: string | null
}

export interface ExchangeMarket {
  id: number
  symbol: string
  pair: string
  metadata: ExchangeMarketMetaData | null
  status: boolean
}

export interface ExchangeMarketMetaData {
  symbol: string
  base: string
  quote: string
  precision: Precision
  limits: Limits
  taker: number
  maker: number
}

export enum ExchangeOrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum ExchangeOrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export enum ExchangeOrderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export enum ExchangeTimeInForce {
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
  PO = 'PO',
}

export interface ExchangeOrder {
  id: number
  uuid: string
  reference_id: string
  user_id: number
  user: User
  status: ExchangeOrderStatus
  symbol: string
  type: ExchangeOrderType
  timeInForce: ExchangeTimeInForce
  side: ExchangeOrderSide
  price: number
  average: number
  amount: number
  filled: number
  remaining: number
  cost: number
  trades?: any
  fee: any
  feeCurrency?: string
  createdAt: Date
  updatedAt: Date
}

export enum BinaryOrderSide {
  RISE = 'RISE',
  FALL = 'FALL',
}

export enum BinaryOrderType {
  RISE_FALL = 'RISE_FALL',
}

export enum BinaryOrderStatus {
  PENDING = 'PENDING',
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface BinaryOrder {
  id: number
  uuid: string
  user_id: number
  user?: User
  symbol: string
  price: number
  amount: number
  profit: number
  side: BinaryOrderSide
  type: BinaryOrderType
  status: BinaryOrderStatus
  is_demo: boolean
  closed_at: Date
  close_price?: number
  created_at: Date
  updated_at: Date
}

type Precision = {
  amount: number
  price: number
}

type Limits = {
  amount: {
    min: number
    max: number
  }
  price: Record<string, any>
  cost: {
    min: number
    max: number
  }
  leverage: Record<string, any>
}

export interface ExchangeCurrency {
  id: number
  currency: string
  name: string
  precision: number
  status: boolean
  chains?: ChainAddress[]
}

type ChainAddress = {
  currency: string
  address: string
  network: string
  tag?: string
}

export interface ExchangeWallet {
  id: number
  uuid: string
  user_id: number
  currency: string
  inOrder?: number
  available?: number
  addresses?: { [key: string]: ChainAddress }
  status: boolean
  user: User
  transactions: ExchangeTransaction[]
}

export interface ExchangeTransaction {
  id: number
  uuid: string
  user_id: number
  wallet_id: number
  chain: string
  memo?: string
  type: string
  amount: number
  fee: number
  toAddress?: string
  txHash?: string
  status: string
  reference_id: string
  user: User
  wallet: ExchangeWallet
  created_at?: Date
  updated_at?: Date
}

export interface WithdrawMethod {
  id: number
  title: string
  processing_time: string
  instructions: string
  image?: string
  fixed_fee: number
  percentage_fee: number
  min_amount: number
  max_amount: number
  custom_fields?: CustomField
  status?: boolean
  created_at: Date
  updated_at: Date
}

export interface DepositMethod {
  id: number
  title: string
  instructions: string
  image?: string
  fixed_fee: number
  percentage_fee: number
  min_amount: number
  max_amount: number
  custom_fields?: CustomField
  status?: boolean
  created_at: Date
  updated_at: Date
}

export interface CustomField {
  title: string
  required: boolean
  type: 'input' | 'textarea' | 'file upload'
}

export interface InvestmentPlan {
  id: number
  name: string
  title: string
  image?: string
  description: string
  currency: string
  min_amount: number
  max_amount: number
  roi: number
  duration: number
  status?: boolean
  created_at: Date
  investment?: Investment[]
}

export interface Investment {
  id: number
  uuid: string
  user_id: number
  plan_id: number
  amount: number
  roi: number
  duration: number
  status: InvestmentStatus
  plan: InvestmentPlan
  created_at: Date
  updated_at: Date
}

export enum InvestmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export interface Chat {
  id: number
  uuid: string
  user_id: number
  user: User
  agent_id: number
  agent: User
  messages: Message[] | null
}

export enum TicketStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  REPLIED = 'REPLIED',
  CLOSED = 'CLOSED',
}

export enum TicketImportance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface SupportTicket {
  id: number
  uuid: string
  userId: number
  chatId?: number
  subject: string
  message: string
  status: TicketStatus
  importance: TicketImportance
  createdAt: Date
  updatedAt: Date
}

export interface Attachment {
  type: string
  image: string
  url: string
  title: string
  description: string
}

export interface Message {
  type: string
  text: string
  time: string
  user_id: number
  agent_id: number
  attachments: Attachment[]
}

export interface Page {
  id: number
  title: string
  content: string
  description?: string
  image?: string
  slug: string
  status: PageStatus
}

export enum PageStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  precision: number
  price?: number
  status: boolean
}

export interface DepositGateway {
  id: number
  name: string
  title: string
  description: string
  image?: string
  alias?: string
  currencies?: any
  fixed_fee?: number
  percentage_fee?: number
  min_amount?: number
  max_amount?: number
  type: DepositGatewayType
  status?: boolean
  version?: string
  productId?: string
}

export enum DepositGatewayType {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
}

// KYC Template Type
export interface KycTemplate {
  id: number
  title: string
  options: Record<string, any> | null
  status: boolean | null
  level: number
  kyc: Kyc[]
}

export interface Kyc {
  id: number
  user_id: number
  template_id: number
  data: Record<string, any> | null
  status: KycStatus
  level: number
  notes?: string
  created_at: Date
  updated_at: Date
}

// KYC Status Enum
export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ExchangeWatchlistType {
  TRADE = 'TRADE',
  BINARY = 'BINARY',
}

export interface ExchangeWatchlist {
  id: number
  userId: number
  user: User
  symbol: string
  type: ExchangeWatchlistType
  createdAt: Date
  updatedAt: Date
}

export interface NotificationTemplate {
  id: number
  name: string
  subject: string
  email_body?: string
  sms_body?: string
  push_body?: string
  short_codes?: JSON
  email?: boolean
  sms?: boolean
  push?: boolean
}

export type OneTimeToken = {
  id: number
  token_id: string
  token_type: string
  expires_at: Date
  date_created: Date
  updated_at: Date | null
}

export interface Extension {
  id: number
  product_id: string
  name: string
  title?: string | null
  description?: string | null
  link?: string | null
  status?: boolean
  version?: string
  image?: string | null
}

export interface RequestContext {
  originalReq: any
  user?: any
  tokens?: any
  headers?: any
  platform?: string
  url?: string
  method?: string
}

export enum AiTradingResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
}

export enum AiTradingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum AiTradingTimeframe {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export interface AiTradingPlan {
  id: number
  name: string
  title: string
  description?: string
  image?: string
  status?: boolean
  invested: number
  profit_percentage: number
  min_profit: number
  max_profit: number
  min_amount: number
  max_amount: number
  trending?: boolean
  default_profit: number
  default_result: AiTradingResult
}

export interface AiTrading {
  id: number
  uuid: string
  user_id: number
  user: User
  plan_id: number
  plan: AiTradingPlan
  duration_id: number
  duration: AiTradingDuration
  market: string
  amount: number
  profit?: number
  result?: AiTradingResult
  status: AiTradingStatus
  created_at: Date
  updated_at: Date
}

export interface AiTradingDuration {
  id: number
  duration: number
  timeframe: AiTradingTimeframe
  ai_trading_plan_duration: AiTradingPlanDuration[]
}

export interface AiTradingPlanDuration {
  id: number
  plan_id: number
  plan: AiTradingPlan
  duration_id: number
  duration: AiTradingDuration
}

export type ParsedTransaction = {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
}

type JsonType = Record<string, any>

// Ecosystem Market
export interface EcosystemMarket {
  id: number
  symbol: string
  pair: string
  is_trending?: boolean
  is_hot?: boolean
  metadata?: EcosystemMarketMetaData
  status: boolean
}

export type EcosystemMarketMetaData = {
  precision: EcosystemMarketPrecision
  limits: EcosystemMarketLimits
  taker: number
  maker: number
}

export type EcosystemMarketLimits = {
  amount: {
    min: number
    max: number
  }
  price: {
    min: number
    max: number
  }
  cost: {
    min: number
    max: number
  }
}

export type EcosystemMarketPrecision = {
  amount: number
  price: number
}

// Ecosystem Order
export interface EcosystemOrder {
  id: number
  uuid: string
  reference_id?: string
  user_id: number
  user: User
  status: EcosystemOrderStatus
  symbol: string
  type: EcosystemOrderType
  timeInForce: EcosystemTimeInForce
  side: EcosystemOrderSide
  price: bigint
  average?: bigint
  amount: bigint
  filled: bigint
  remaining: bigint
  cost: bigint
  trades?: TradeDetail[]
  fee: bigint
  fee_currency: string
  created_at: Date
  updated_at: Date
}

export interface TradeDetail {
  uuid: string
  amount: number
  price: number
  cost: number
  side: EcosystemOrderSide
  timestamp: number
}

// Ecosystem Order Side
export enum EcosystemOrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

// Ecosystem Order Type
export enum EcosystemOrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

// Ecosystem Order Status
export enum EcosystemOrderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

// Ecosystem Time In Force
export enum EcosystemTimeInForce {
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
  PO = 'PO',
}

// Ecosystem Private Ledger
export interface EcosystemPrivateLedger {
  id: number
  wallet_id: number
  index: number
  currency: string
  chain: string
  network: string
  offchain_difference: number
}

// Type for ecosystem_custodial_wallet model
export interface EcosystemCustodialWallet {
  id: number
  uuid: string
  master_wallet_id: number
  master_wallet: EcosystemMasterWallet
  address: string
  chain: string
  status: CustodialWalletStatus
  created_at: Date
}

// Enum for CustodialWalletStatus
export enum CustodialWalletStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
export interface ForexAccount {
  id: number
  user_id?: number
  user?: User
  account_id?: string
  password?: string
  broker?: string
  mt?: number
  balance?: number
  status?: boolean
  type: 'LIVE' | 'DEMO'
  created_at?: Date
}

export type ForexPlan = {
  id: number
  name: string
  title: string
  description?: string
  image?: string
  status?: boolean
  invested: number
  profit_percentage: number
  min_profit: number
  max_profit: number
  min_amount: number
  max_amount: number
  trending?: boolean
  default_profit: number
  default_result: ForexInvestmentResult
  created_at: Date
  forexLog: ForexLog[]
  forexPlanDuration: ForexPlanDuration[]
}

export type ForexLog = {
  id: number
  uuid: string
  user_id: number
  plan_id: number | null
  duration_id: number | null
  type: ForexLogType
  amount: number | null
  profit: number | null
  currency: string | null
  trx: string | null
  result: ForexInvestmentResult | null
  status: ForexLogStatus
  created_at: Date
  end_date: Date
  duration: ForexDuration | null
  plan: ForexPlan | null
}

export enum ForexInvestmentResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
}

export enum ForexLogStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum ForexLogType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  INVESTMENT = 'INVESTMENT',
  INVESTMENT_ROI = 'INVESTMENT_ROI',
}

export type ForexPlanDuration = {
  id: number
  plan_id: number
  duration_id: number
  plan: ForexPlan
  duration: ForexDuration
}

export type ForexDuration = {
  id: number
  duration: number
  timeframe: ForexTimeframe
}

export enum ForexTimeframe {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export type ForexSignal = {
  id: number
  title: string
  image: string
  status: ForexSignalStatus
  createdAt: Date
  forexAccounts: ForexAccountSignal[]
}

export enum ForexSignalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type ForexAccountSignal = {
  forexAccountId: number
  forexSignalId: number
}

export type ForexCurrency = {
  id: number
  currency: string
  type?: string
  status: boolean
}
