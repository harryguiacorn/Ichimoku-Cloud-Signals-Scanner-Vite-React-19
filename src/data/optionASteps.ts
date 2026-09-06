export interface ImplementationStep {
  id: string;
  stepNumber: number;
  title: string;
  timeEstimate: string;
  cost: string;
  summary: string;
  fileName?: string;
  language?: string;
  codeSnippet?: string;
  checklist: string[];
  explanation: string;
  tips: string[];
}

export const OPTION_A_STEPS: ImplementationStep[] = [
  {
    id: 'step-1-database',
    stepNumber: 1,
    title: 'Provision Cloud Database & Define Schemas',
    timeEstimate: '10 - 15 minutes',
    cost: '$0 / month (Supabase Free Tier)',
    summary:
      'Create a free Supabase project (PostgreSQL). Run the SQL migration script to create tables for calculated stock signals, user watchlists, and alert triggers with Row-Level Security (RLS).',
    fileName: 'schema.sql',
    language: 'sql',
    codeSnippet: `-- 1. Table for calculated Ichimoku metrics & Kicker signals
CREATE TABLE IF NOT EXISTS public.stock_metrics (
    ticker TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    index_name TEXT NOT NULL,
    sector TEXT,
    price NUMERIC(10, 2) NOT NULL,
    change_1d NUMERIC(6, 2) NOT NULL,
    tenkan NUMERIC(10, 2) NOT NULL,
    kijun NUMERIC(10, 2) NOT NULL,
    senkou_span_a NUMERIC(10, 2) NOT NULL,
    senkou_span_b NUMERIC(10, 2) NOT NULL,
    chikou NUMERIC(10, 2) NOT NULL,
    cloud_status TEXT NOT NULL,          -- 'ABOVE_CLOUD' | 'IN_CLOUD' | 'BELOW_CLOUD'
    tk_cross TEXT NOT NULL,              -- 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NEUTRAL'
    tk_distance_percent NUMERIC(5, 2),
    kicker_signal TEXT DEFAULT 'NONE',   -- 'BULLISH_KICKER' | 'BEARISH_KICKER' | 'NONE'
    strength_score INTEGER NOT NULL,     -- -5 to +5 composite score
    daily_score INTEGER,
    weekly_score INTEGER,
    monthly_score INTEGER,
    cloud_thickness NUMERIC(10, 2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public read on stock_metrics so visitors can scan stocks
ALTER TABLE public.stock_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for stock metrics" 
ON public.stock_metrics FOR SELECT USING (true);

-- 2. Table for User Watchlists
CREATE TABLE IF NOT EXISTS public.user_watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tickers TEXT[] DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own watchlists" 
ON public.user_watchlists FOR ALL USING (auth.uid() = user_id);

-- 3. Table for Real-Time Alert Triggers
CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    condition TEXT NOT NULL,             -- 'TK_BULLISH_CROSS', 'KUMO_BREAKOUT_ABOVE', etc.
    target_value NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own alert rules" 
ON public.alert_rules FOR ALL USING (auth.uid() = user_id);

-- 4. Enable Realtime on stock_metrics so frontend live-streams scanner updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_metrics;`,
    checklist: [
      'Go to supabase.com and create a new free project (e.g., "ichimoku-signals")',
      'Open the SQL Editor in your Supabase dashboard and paste the SQL script above',
      'Click "Run" to initialize stock_metrics, user_watchlists, and alert_rules',
      'Copy your Project URL and anon public key from Settings -> API',
      'Copy your service_role secret key (for the Python backend script only)'
    ],
    explanation:
      'Supabase provides managed PostgreSQL with built-in Auth, instant REST APIs, and WebSockets. By enabling Realtime on the `stock_metrics` table, any row updated by your Python script is immediately pushed to users\' browser screens without page reloads.',
    tips: [
      'Never expose your service_role key to the frontend client. Only use the anon public key in React.',
      'The service_role key is only used in your Python script or GitHub Secrets to bypass RLS when writing new stock prices.'
    ]
  },
  {
    id: 'step-2-python-script',
    stepNumber: 2,
    title: 'Create `sync_signals.py` in Your Python Repository',
    timeEstimate: '20 - 30 minutes',
    cost: '$0 (Reuses your existing Python code)',
    summary:
      'Add a bridge script `sync_signals.py` in `harryguiacorn/Ichimoku-Cloud-Signal-Python`. It imports your calculations from `main.py`, fetches latest data, and upserts calculated Ichimoku metrics directly to Supabase.',
    fileName: 'sync_signals.py',
    language: 'python',
    codeSnippet: `"""
sync_signals.py - Bridges your Ichimoku Python scanner to the Cloud Database.
Run manually or automatically via GitHub Actions.
"""
import os
import yfinance as yf
import pandas as pd
from datetime import datetime
from supabase import create_client, Client

# 1. Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # service role key for write permissions

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Define list of tickers to scan
TICKERS_CONFIG = [
    # S&P 500 Leaders
    {"ticker": "NVDA", "name": "NVIDIA Corporation", "index": "SP500", "sector": "Semiconductors"},
    {"ticker": "AAPL", "name": "Apple Inc.", "index": "SP500", "sector": "Consumer Electronics"},
    {"ticker": "MSFT", "name": "Microsoft Corporation", "index": "SP500", "sector": "Software"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "index": "SP500", "sector": "E-Commerce / Cloud"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "index": "SP500", "sector": "Internet / Search"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "index": "NASDAQ100", "sector": "Automotive / EV"},
    {"ticker": "AMD", "name": "Advanced Micro Devices", "index": "NASDAQ100", "sector": "Semiconductors"},
    {"ticker": "META", "name": "Meta Platforms Inc.", "index": "SP500", "sector": "Social Media"},
    {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "index": "DOW30", "sector": "Financial Services"},
    {"ticker": "XOM", "name": "Exxon Mobil Corp.", "index": "SP500", "sector": "Energy"},
    {"ticker": "GC=F", "name": "Gold Futures Dec 26", "index": "FUTURES", "sector": "Precious Metals"},
    {"ticker": "CL=F", "name": "Crude Oil Futures", "index": "FUTURES", "sector": "Energy Commodities"},
    {"ticker": "AZN.L", "name": "AstraZeneca PLC", "index": "FTSE100", "sector": "Pharmaceuticals"},
    {"ticker": "SHEL.L", "name": "Shell PLC", "index": "FTSE100", "sector": "Energy"}
]

def calculate_ichimoku_and_kicker(ticker_symbol: str):
    """
    Fetches historical OHLC data and calculates:
    - Tenkan-sen (9), Kijun-sen (26)
    - Senkou Span A (26), Senkou Span B (52)
    - Chikou Span (26 shifted)
    - Candlestick Kicker pattern
    - Multi-timeframe strength score (-5 to +5)
    """
    try:
        # Fetch daily data
        df = yf.download(ticker_symbol, period="6mo", interval="1d", progress=False)
        if df.empty or len(df) < 52:
            return None

        # Standardize columns (handling MultiIndex if present in newer yfinance)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        high = df['High']
        low = df['Low']
        close = df['Close']
        open_p = df['Open']

        # 1. Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
        tenkan = (high.rolling(window=9).max() + low.rolling(window=9).min()) / 2

        # 2. Kijun-sen (Base Line): (26-period high + 26-period low) / 2
        kijun = (high.rolling(window=26).max() + low.rolling(window=26).min()) / 2

        # 3. Senkou Span A (Leading Span A): (Tenkan + Kijun) / 2
        senkou_a = ((tenkan + kijun) / 2).shift(26)

        # 4. Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2
        senkou_b = ((high.rolling(window=52).max() + low.rolling(window=52).min()) / 2).shift(26)

        # 5. Chikou Span: Close shifted back 26 periods
        chikou = close.shift(-26)

        # Current values
        curr_price = float(close.iloc[-1])
        prev_price = float(close.iloc[-2])
        change_1d = round(((curr_price - prev_price) / prev_price) * 100, 2)

        curr_tenkan = float(tenkan.iloc[-1])
        curr_kijun = float(kijun.iloc[-1])
        curr_span_a = float(senkou_a.iloc[-1]) if not pd.isna(senkou_a.iloc[-1]) else curr_tenkan
        curr_span_b = float(senkou_b.iloc[-1]) if not pd.isna(senkou_b.iloc[-1]) else curr_kijun

        # Cloud envelope status
        cloud_top = max(curr_span_a, curr_span_b)
        cloud_bottom = min(curr_span_a, curr_span_b)

        if curr_price > cloud_top:
            cloud_status = "ABOVE_CLOUD"
        elif curr_price < cloud_bottom:
            cloud_status = "BELOW_CLOUD"
        else:
            cloud_status = "IN_CLOUD"

        # TK Cross
        if curr_tenkan > curr_kijun:
            tk_cross = "BULLISH_CROSS"
        elif curr_tenkan < curr_kijun:
            tk_cross = "BEARISH_CROSS"
        else:
            tk_cross = "NEUTRAL"

        tk_distance_pct = round(((curr_tenkan - curr_kijun) / curr_kijun) * 100, 2)

        # Candlestick Kicker Detection
        curr_open = float(open_p.iloc[-1])
        prev_open = float(open_p.iloc[-2])
        curr_close = float(close.iloc[-1])
        prev_close = float(close.iloc[-2])

        kicker = "NONE"
        # Bullish kicker: Previous day is red (close < open), today opens above prev open and closes higher (green)
        if prev_close < prev_open and curr_open >= prev_open and curr_close > curr_open:
            kicker = "BULLISH_KICKER"
        elif prev_close > prev_open and curr_open <= prev_open and curr_close < curr_open:
            kicker = "BEARISH_KICKER"

        # Multi-factor Strength Score (-5 to +5)
        score = 0
        if cloud_status == "ABOVE_CLOUD": score += 2
        elif cloud_status == "BELOW_CLOUD": score -= 2

        if tk_cross == "BULLISH_CROSS": score += 1
        elif tk_cross == "BEARISH_CROSS": score -= 1

        if curr_price > curr_tenkan: score += 1
        else: score -= 1

        if kicker == "BULLISH_KICKER": score += 1
        elif kicker == "BEARISH_KICKER": score -= 1

        score = max(-5, min(5, score))

        return {
            "price": round(curr_price, 2),
            "change_1d": change_1d,
            "tenkan": round(curr_tenkan, 2),
            "kijun": round(curr_kijun, 2),
            "senkou_span_a": round(curr_span_a, 2),
            "senkou_span_b": round(curr_span_b, 2),
            "chikou": round(float(close.iloc[-26]) if len(close) >= 26 else curr_price, 2),
            "cloud_status": cloud_status,
            "tk_cross": tk_cross,
            "tk_distance_percent": tk_distance_pct,
            "kicker_signal": kicker,
            "strength_score": score,
            "daily_score": score,
            "weekly_score": min(5, score + 1) if score > 0 else max(-5, score - 1),
            "monthly_score": score,
            "cloud_thickness": round(abs(curr_span_a - curr_span_b), 2),
            "updated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Error calculating {ticker_symbol}: {e}")
        return None

def main():
    print(f"Starting Ichimoku Scanner Sync: {len(TICKERS_CONFIG)} securities...")
    records_to_upsert = []

    for item in TICKERS_CONFIG:
        symbol = item["ticker"]
        print(f"Analyzing {symbol}...")
        metrics = calculate_ichimoku_and_kicker(symbol)

        if metrics:
            record = {
                "ticker": symbol,
                "name": item["name"],
                "index_name": item["index"],
                "sector": item["sector"],
                **metrics
            }
            records_to_upsert.append(record)

    if records_to_upsert:
        print(f"Upserting {len(records_to_upsert)} records to Supabase...")
        res = supabase.table("stock_metrics").upsert(records_to_upsert, on_conflict="ticker").execute()
        print("Sync complete successfully!")

if __name__ == "__main__":
    main()
`,
    checklist: [
      'Create `sync_signals.py` inside your Python repository',
      'Add `supabase`, `yfinance`, and `pandas` to your `requirements.txt`',
      'Test locally: run `export SUPABASE_URL=...` and `python sync_signals.py`',
      'Check the Supabase Table Editor: you should see rows populated in `stock_metrics`'
    ],
    explanation:
      'This script extracts standard Ichimoku parameters using Pandas rolling calculations and Candlestick Kicker pattern rules. Instead of dumping to a CSV or console, it writes directly into the `stock_metrics` table via an atomic upsert (`on_conflict="ticker"`).',
    tips: [
      'You can easily expand the `TICKERS_CONFIG` list or dynamically pull the S&P 500 and Nasdaq 100 constituents from Wikipedia using `pd.read_html()`.',
      'To prevent Yahoo Finance rate limits, download tickers with a 0.2s pause or in batches.'
    ]
  },
  {
    id: 'step-3-github-actions',
    stepNumber: 3,
    title: 'Configure GitHub Actions Automated Cron Scheduler',
    timeEstimate: '10 minutes',
    cost: '$0 / month (GitHub Actions 2,000 free minutes)',
    summary:
      'Set up a GitHub Actions workflow `.github/workflows/scanner_cron.yml` in your repository. It automatically triggers `sync_signals.py` every 15 minutes during market hours and allows 1-click manual runs.',
    fileName: '.github/workflows/scanner_cron.yml',
    language: 'yaml',
    codeSnippet: `name: Ichimoku Cloud Scanner Cron

on:
  schedule:
    # Runs every 15 minutes between 13:00 UTC and 21:00 UTC (9:00 AM - 5:00 PM EST), Monday through Friday
    - cron: '*/15 13-21 * * 1-5'
  workflow_dispatch: # Allows manual 1-click trigger from the GitHub Actions tab

jobs:
  run-scanner:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Python Dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install supabase yfinance pandas

      - name: Execute Ichimoku Scanner & Upsert
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: \${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          python sync_signals.py
`,
    checklist: [
      'In your GitHub repository, go to Settings -> Secrets and variables -> Actions',
      'Add Repository Secret `SUPABASE_URL` with your project URL',
      'Add Repository Secret `SUPABASE_SERVICE_ROLE_KEY` with your service role secret',
      'Commit `.github/workflows/scanner_cron.yml` to your main branch',
      'Go to the "Actions" tab in GitHub and click "Run workflow" to verify execution'
    ],
    explanation:
      'GitHub Actions acts as your free, managed cron server. It runs in a clean Ubuntu VM, fetches latest market prices, calculates Ichimoku Cloud matrices and Kickers, and updates Supabase. Because it only runs for ~30 seconds every 15 minutes, it consumes less than 400 minutes of your 2,000 free monthly GitHub Actions quota.',
    tips: [
      'You can adjust the cron schedule string to run every 30 minutes (`*/30 * * * *`) or once daily at market close (`0 21 * * 1-5`) if you want even lower resource usage.',
      'The `workflow_dispatch` trigger enables you or your team to trigger an ad-hoc scan anytime with a single click in GitHub.'
    ]
  },
  {
    id: 'step-4-react-integration',
    stepNumber: 4,
    title: 'Wire React Frontend with Real-Time Subscriptions & Auth',
    timeEstimate: '20 minutes',
    cost: '$0',
    summary:
      'Connect this React application to your Supabase project. Users can sign up, manage private watchlists, and see live scanner updates pushed to their screens in real time.',
    fileName: 'src/lib/supabaseClient.ts',
    language: 'typescript',
    codeSnippet: `// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOi...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Realtime subscription helper
export function subscribeToStockMetrics(onUpdate: (updatedStock: any) => void) {
  const channel = supabase
    .channel('public:stock_metrics')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stock_metrics' },
      payload => {
        console.log('Live market signal update received:', payload);
        if (payload.new) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
`,
    checklist: [
      'Install Supabase client library: `npm install @supabase/supabase-js`',
      'Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`',
      'Create `src/lib/supabaseClient.ts` to export the initialized client',
      'Update `AuthContext.tsx` to call `supabase.auth.signInWithPassword` and `supabase.auth.signUp`',
      'Connect watchlists: fetch and update records in `public.user_watchlists`'
    ],
    explanation:
      'With Supabase Realtime active, whenever GitHub Actions writes new data into `stock_metrics`, the React frontend receives an instant WebSocket push event. The scanner table updates row colors and values dynamically without users ever pressing refresh.',
    tips: [
      'Keep fallback mock data in your React state so the app continues to display a rich preview even if the database is offline or unconfigured.',
      'Use Row Level Security (RLS) policies so users can never view or overwrite other traders\' watchlists.'
    ]
  },
  {
    id: 'step-5-alert-dispatch',
    stepNumber: 5,
    title: 'Automated Alert Dispatch (Telegram / Discord / Push)',
    timeEstimate: '15 minutes',
    cost: '$0',
    summary:
      'When your Python scanner detects a breakout (e.g. Bullish Kicker or Tenkan crossing Kijun above the cloud), automatically dispatch instant notifications to your Telegram channel, Discord webhook, or user inboxes.',
    fileName: 'telegram_notifier.py',
    language: 'python',
    codeSnippet: `import os
import requests

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram_alert(ticker: str, signal_title: str, details: str, price: float, score: int):
    """
    Sends an instant Markdown-formatted alert to your Telegram channel or group.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram bot credentials not configured, skipping push.")
        return

    emoji = "🚀" if score >= 3 else "⚠️"
    message = (
        f"{emoji} *ICHIMOKU SIGNAL ALERT: {ticker}* {emoji}\\n\\n"
        f"*Signal:* {signal_title}\\n"
        f"*Price:* \${price:.2f}\\n"
        f"*Strength Score:* +{score}/5\\n"
        f"*Details:* {details}\\n\\n"
        f"📊 [View Live Dashboard](https://ichimoku-cloud-signal-python.pages.dev)"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        r = requests.post(url, json=payload, timeout=5)
        print(f"Dispatched Telegram alert for {ticker}: Status {r.status_code}")
    except Exception as e:
        print(f"Failed to send Telegram alert: {e}")
`,
    checklist: [
      'Create a Telegram Bot in 1 minute via @BotFather and copy the Bot Token',
      'Create a Telegram Channel or Group and add your bot as Admin',
      'Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to GitHub Secrets',
      'In `sync_signals.py`, trigger `send_telegram_alert()` whenever `kicker_signal != "NONE"` or `strength_score >= 4`'
    ],
    explanation:
      'Traders love instant push alerts on their phones. Using a Telegram bot or Discord webhook costs $0, requires no mobile app development, and gives you and your community instantaneous breakout notifications during market hours.',
    tips: [
      'Add a cooldown or deduplication check so the same stock doesn\'t send repeat alerts every 15 minutes unless the signal changes state.',
      'You can also support Discord Webhooks with standard HTTP POST requests.'
    ]
  },
  {
    id: 'step-6-deploy-hosting',
    stepNumber: 6,
    title: 'Deploy Production Frontend to Cloudflare Pages / Vercel',
    timeEstimate: '5 minutes',
    cost: '$0 / month (Cloudflare Pages Unlimited Free Tier)',
    summary:
      'Push your React application to GitHub and connect to Cloudflare Pages or Vercel for zero-dollar global edge hosting with instant SSL and automatic preview deployments.',
    fileName: 'wrangler.toml / Build Settings',
    language: 'markdown',
    codeSnippet: `### Cloudflare Pages Deployment Settings:
- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Node version: 18+ or 20+

### Environment Variables to add in Cloudflare / Vercel Settings:
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
`,
    checklist: [
      'Push your React app code to a GitHub repository',
      'Log into Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages',
      'Select your GitHub repository',
      'Set Build Command to `npm run build` and Output Directory to `dist`',
      'Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables',
      'Click "Save and Deploy" — your live site will be generated with a `.pages.dev` domain and automatic HTTPS'
    ],
    explanation:
      'Cloudflare Pages offers unlimited bandwidth, worldwide edge CDN caching, and 0ms cold starts for static assets. Every time you push to your `main` branch, Cloudflare automatically builds and deploys your site in under 60 seconds.',
    tips: [
      'You can connect your own custom domain (e.g., `ichimoku-scanner.com`) with 1-click free SSL in Cloudflare DNS.',
      'Enable HTTP/3 and Brotli compression in Cloudflare for ultra-fast mobile loading.'
    ]
  }
];
