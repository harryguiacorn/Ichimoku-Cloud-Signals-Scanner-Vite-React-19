export type MarketIndex = 
  | 'SPX500' 
  | 'Nasdaq100' 
  | 'DowJones30' 
  | 'Russell1000' 
  | 'FTSE100' 
  | 'FTSE250' 
  | 'Futures' 
  | 'FuturesCurrency' 
  | 'HSI' 
  | 'Kraken' 
  | 'Oanda' 
  | 'SPDR_ETFS' 
  | 'SP500' 
  | 'NASDAQ100' 
  | 'DOW30' 
  | 'FUTURES' 
  | 'FOREX';

export interface CloudScanRow {
  symbol: string;
  name: string;
  close: number;
  cloud1H: number;
  cloud1D: number;
  cloud1W: number;
  cloud1M: number;
  cloudSum: number;
  tkx1H: number;
  tkx1D: number;
  tkx1W: number;
  tkx1M: number;
  tkxSum: number;
  totalScoreSum: number;
  index: string;
}

export interface ChikouScanRow {
  symbol: string;
  name: string;
  dir1H: number;
  count1H: number;
  state1H: string;
  dir1D: number;
  count1D: number;
  state1D: string;
  dir1W: number;
  count1W: number;
  state1W: string;
  dir1M: number;
  count1M: number;
  state1M: string;
  chikouScoreSum: number;
  index: string;
}

export interface GitHubSyncMeta {
  lastUpdated: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  url: string;
  lastChecked?: string;
  isAutoUpdated?: boolean;
}

export type SignalType = 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';

export type CloudStatus = 'ABOVE_CLOUD' | 'IN_CLOUD' | 'BELOW_CLOUD';

export type KickerType = 'BULLISH_KICKER' | 'BEARISH_KICKER' | 'NONE';

export interface IchimokuValues {
  tenkan: number;        // Conversion Line (9 periods)
  kijun: number;         // Base Line (26 periods)
  senkouSpanA: number;   // Leading Span A (Shifted 26 periods ahead)
  senkouSpanB: number;   // Leading Span B (Shifted 26 periods ahead)
  chikou: number;        // Lagging Span (Close shifted 26 periods behind)
  cloudColor: 'BULLISH_GREEN' | 'BEARISH_RED';
  cloudThickness: number; // In points / %
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tenkan?: number;
  kijun?: number;
  senkouSpanA?: number;
  senkouSpanB?: number;
  chikou?: number;
}

export interface StockConstituent {
  ticker: string;
  name: string;
  index: MarketIndex;
  sector: string;
  price: number;
  change1D: number;
  change1W: number;
  change1M: number;
  volume: string;
  marketCap: string;
  cloudStatus: CloudStatus;
  tkCross: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NEUTRAL';
  tkDistancePercent: number; // Distance between Tenkan and Kijun
  kickerSignal: KickerType;
  strengthScore: number;     // Range -5 to +5 (like in Python backend)
  timeframeScores: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  ichimoku: IchimokuValues;
  signalSummary: string;
  historicalCandles?: CandleData[];
  lastUpdated: string;
  cloudRow?: CloudScanRow;
  chikouRow?: ChikouScanRow;
  totalScoreSum?: number;
  cloudSum?: number;
  tkxSum?: number;
  chikouSum?: number;
  source?: 'github_csv' | 'mock';
}

export interface UserWatchlist {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  createdAt: string;
  tickers: string[];
}

export interface AlertTrigger {
  id: string;
  ticker: string;
  condition: 'TK_BULLISH_CROSS' | 'TK_BEARISH_CROSS' | 'KUMO_BREAKOUT_ABOVE' | 'KUMO_BREAKDOWN_BELOW' | 'BULLISH_KICKER' | 'BEARISH_KICKER' | 'STRENGTH_SCORE_GTE' | 'PRICE_ABOVE' | 'PRICE_BELOW';
  targetValue?: number;
  active: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
  soundEnabled: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface AlertNotification {
  id: string;
  alertId?: string;
  ticker: string;
  title: string;
  message: string;
  signalType: SignalType;
  timestamp: string;
  read: boolean;
  priceAtTrigger: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  tradingExperience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
  favoriteIndices: MarketIndex[];
  emailAlertsEnabled: boolean;
  soundAlertsEnabled: boolean;
  pythonBackendUrl?: string;
  createdAt: string;
}

export interface ArchitectureOption {
  id: string;
  title: string;
  subtitle: string;
  recommendedFor: string;
  summary: string;
  diagram: string;
  pros: string[];
  cons: string[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    queueOrWorker: string;
    hosting: string;
  };
  costEstimate: string;
  complexity: 'Low' | 'Medium' | 'High';
  latency: string;
}
