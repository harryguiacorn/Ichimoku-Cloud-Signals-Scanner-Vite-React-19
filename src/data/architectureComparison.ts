import { ArchitectureOption } from '../types';

export const ARCHITECTURE_OPTIONS: ArchitectureOption[] = [
  {
    id: 'option-serverless',
    title: 'Option A: Serverless Event-Driven Hub',
    subtitle: 'Best for Ultra-Low Cost, Scalability & Zero-Maintenance',
    recommendedFor: 'Solo developers, MVP stage, and teams wanting zero server upkeep with sub-second page loads.',
    summary: 'The existing Python scanner (`main.py`) runs on a scheduled worker (GitHub Actions cron, Modal.com, or Google Cloud Run Job every 5–15 mins during market hours). It writes calculated Ichimoku signals to a hosted cloud database (Supabase / Firebase Firestore). The React/Vite frontend subscribes to real-time database changes and handles user registration, custom watchlists, and client-side notifications seamlessly.',
    diagram: `[Python Scanner: GitHub Actions / Cloud Run]
       │ (Every 15 min or market close)
       ▼
[Cloud Database: Supabase / Firebase / Cloudflare D1]
       ▲
       │ (Realtime Subscriptions / REST API)
[React Vite Frontend] ◄──► [Auth & User Watchlists]
       │
       ▼
[Browser Alerts / Push / Telegram Bot]`,
    pros: [
      'Extremely Low Cost: $0 - $10/month on generous free tiers (Cloudflare Pages, Supabase/Firebase free tier, GitHub Actions).',
      'No 24/7 Servers to Manage: Eliminates server crashes, memory leaks, and OS security patches.',
      'Global Edge Speed: Static assets cached globally via Cloudflare CDN with instant load times.',
      'Built-in Authentication & Database: Out-of-the-box user accounts, social logins, and row-level security for watchlists.',
      'Natural Evolution: Can reuse the exact Python script already in your GitHub repository with minimal refactoring.'
    ],
    cons: [
      'Latency: Scanner updates are batch/cron-based (e.g., 5-15 mins) rather than tick-by-tick real-time streaming.',
      'Cold Starts: If using serverless functions for ad-hoc requests, slight initial cold start delay (1-2s).',
      'Yahoo Finance Scraping Rate Limits: Running large simultaneous batches across 500+ stocks in serverless can encounter IP throttling without proxy rotation.'
    ],
    techStack: {
      frontend: 'React 19 + Vite + Tailwind CSS (hosted on Cloudflare Pages or Vercel)',
      backend: 'Python 3.11 + GitHub Actions / Modal.com / Cloud Run Job',
      database: 'Supabase (PostgreSQL) or Firebase Firestore',
      queueOrWorker: 'GitHub Actions cron / Cloudflare Queues',
      hosting: 'Cloudflare Pages (Frontend) + Cloudflare Workers / Serverless'
    },
    costEstimate: '$0 – $15 / month',
    complexity: 'Low',
    latency: '5 to 15 min batch interval'
  },
  {
    id: 'option-hybrid-microservice',
    title: 'Option B: Hybrid Python FastAPI + WebSockets Microservice',
    subtitle: 'Best for True Real-Time Market Ticks, Professional Scalability & Custom Algos',
    recommendedFor: 'Active day traders, swing traders needing sub-second alerts, and commercial trading platforms.',
    summary: 'Wrap your Python Ichimoku calculation logic into a high-performance FastAPI service running inside a Docker container (Render, Fly.io, or AWS ECS). It maintains an in-memory or Redis-backed market cache and a persistent WebSocket connection to broadcast live TK crosses, Kumo breakouts, and Kicker signals directly to registered clients.',
    diagram: `[Live Market Feed: Polygon / Alpaca / Yahoo Websocket]
       │
       ▼
[FastAPI Python Microservice (In-Memory Ichimoku Engine)]
       ├──► [Redis Cache & Pub/Sub]
       └──► [PostgreSQL: User Watchlists & Alert Rules]
       │ (Bi-directional WebSockets)
       ▼
[Modern React Frontend] ──► [Instant Audio / Toast / SMS / Webhooks]`,
    pros: [
      'Sub-Second Real-Time Alerts: Instantly alerts users the moment Tenkan crosses Kijun or candle breaks the Kumo cloud.',
      'Direct Python Execution: 100% compatibility with Pandas, NumPy, TA-Lib, and your existing `main.py` algorithms without any rewrite.',
      'High Customization: Allows users to run custom Ichimoku parameter backtests (e.g. 7-22-44 or 9-26-52) on demand.',
      'Full Database Control: Dedicated relational database for advanced multi-stock analytics and complex portfolio tracking.'
    ],
    cons: [
      'Higher Hosting Cost: Continuous container hosting (FastAPI + Redis + Postgres) typically starts at $25 – $65/month.',
      'Operational Overhead: Requires managing container restarts, health checks, database connections, and WebSocket connection drops.',
      'Requires Streaming Market Data: To get true real-time ticks, requires a paid or authenticated financial API (e.g., Alpaca, Polygon.io, or Interactive Brokers).'
    ],
    techStack: {
      frontend: 'React 19 + TypeScript + Tailwind CSS + Lucide Icons',
      backend: 'Python FastAPI + Celery / Redis Streams',
      database: 'PostgreSQL (with TimescaleDB extension for time-series candles)',
      queueOrWorker: 'Celery + Redis Worker',
      hosting: 'Render / Fly.io / AWS ECS / DigitalOcean Droplet'
    },
    costEstimate: '$25 – $70 / month',
    complexity: 'High',
    latency: '< 500 milliseconds (Live WebSocket)'
  },
  {
    id: 'option-edge-api-gateway',
    title: 'Option C: Decoupled API Gateway + Dedicated Worker Pipeline',
    subtitle: 'Best for Balanced Growth, Team Development & Clean Architecture',
    recommendedFor: 'SaaS products planning to add mobile apps (iOS/Android) and multiple client interfaces.',
    summary: 'Separates the system into three distinct tiers: (1) Python Data Worker calculating signals every interval; (2) Node.js / Express API Gateway handling Auth, Watchlists, Billing, and Notifications; (3) React Frontend. A shared PostgreSQL database keeps state synchronised.',
    diagram: `[Python Scanner Worker] ──► Writes Signals ──┐
                                                 ▼
[React Web App] ◄── REST/GraphQL ──► [Node.js Gateway] ◄──► [PostgreSQL DB]
[Mobile App]    ◄── Push / Webhook ─┘`,
    pros: [
      'Clean Separation of Concerns: Python handles heavy numeric calculations; Node handles authentication, user watchlists, stripe billing, and alerts.',
      'Multi-Platform Ready: Easy to build iOS and Android apps using the same API Gateway.',
      'Independent Scaling: Can scale the compute-heavy Python scanner without touching the high-traffic web server.'
    ],
    cons: [
      'Multiple Codebases: Need to maintain both Python and TypeScript/Node.js backend environments.',
      'Coordination Complexity: Requires synchronized database schemas and API versioning contracts.'
    ],
    techStack: {
      frontend: 'React 19 / Next.js',
      backend: 'Node.js Express Gateway + Python 3 Worker',
      database: 'PostgreSQL (Supabase or AWS RDS)',
      queueOrWorker: 'BullMQ / Redis',
      hosting: 'Vercel / Cloudflare (Frontend) + Railway / Render (APIs)'
    },
    costEstimate: '$15 – $40 / month',
    complexity: 'Medium',
    latency: '1 to 3 minutes'
  }
];

export const STEP_BY_STEP_RECOMMENDATION = {
  verdict: 'Recommended Path for Your Project: Option A transitioning to Option B',
  phase1: 'Phase 1 (Immediate / MVP): Connect your existing GitHub repository using GitHub Actions Cron or a free Modal/Cloud Run job to push scan results to a free Supabase PostgreSQL database. Deploy the interactive React frontend to Cloudflare Pages. Users get authentication, custom watchlists, and 15-minute alerts for $0/month.',
  phase2: 'Phase 2 (Production / Scale): Once you gain traction and active users, containerize the Python scanner with FastAPI and attach a WebSocket feed with Polygon.io or Alpaca for live real-time breakout alerts.'
};
