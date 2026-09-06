import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  Sparkles,
  BarChart3,
  Flame,
  LineChart,
  Plus
} from 'lucide-react';
import { StockConstituent } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeroHomeProps {
  onExploreScanner: () => void;
  onOpenDashboard: () => void;
  onOpenArchitecture: () => void;
  onSelectStock: (stock: StockConstituent) => void;
  stocks: StockConstituent[];
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  onExploreScanner,
  onOpenDashboard,
  onOpenArchitecture,
  onSelectStock,
  stocks
}) => {
  const { isAuthenticated, loginAsGuest, addTickerToWatchlist, activeWatchlistId, isTickerInWatchlist } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BULLISH' | 'KICKER' | 'TOP_SCORE'>('TOP_SCORE');

  const filteredPreview = stocks.filter(stock => {
    if (activeFilter === 'BULLISH') return stock.cloudStatus === 'ABOVE_CLOUD' && stock.tkCross === 'BULLISH_CROSS';
    if (activeFilter === 'KICKER') return stock.kickerSignal !== 'NONE';
    if (activeFilter === 'TOP_SCORE') return stock.strengthScore >= 4;
    return true;
  }).slice(0, 6);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow effect behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Automated Python Market Scanner & Live Signal Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Trade With The Cloud. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Systematic Ichimoku & Kicker Signals
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          A high-performance technical scanner that sweeps the S&P 500, Nasdaq 100, Dow 30, FTSE 100, and Futures.
          Track high-probability momentum setups, Kumo breakouts, and Candlestick Kickers on your personalized dashboard.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreScanner}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <Activity className="w-4 h-4 text-slate-950" />
            <span>Launch Market Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isAuthenticated ? (
            <button
              onClick={loginAsGuest}
              className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Guest Demo Trader</span>
            </button>
          ) : (
            <button
              onClick={onOpenDashboard}
              className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <LineChart className="w-4 h-4 text-cyan-400" />
              <span>Go to My Personal Dashboard</span>
            </button>
          )}

          <button
            onClick={onOpenArchitecture}
            className="px-5 py-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all flex items-center space-x-2"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Architecture & Trade-Offs</span>
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-2xl font-bold text-white font-mono">5 Major</div>
            <div className="text-xs text-slate-400 mt-1">Indices & Futures Scanned</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-2xl font-bold text-cyan-400 font-mono">-5 to +5</div>
            <div className="text-xs text-slate-400 mt-1">Multi-Timeframe Score</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-2xl font-bold text-emerald-400 font-mono">Real-Time</div>
            <div className="text-xs text-slate-400 mt-1">TK Cross & Kumo Alerts</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left">
            <div className="text-2xl font-bold text-purple-400 font-mono">1-Click</div>
            <div className="text-xs text-slate-400 mt-1">Personal Watchlist Hub</div>
          </div>
        </div>
      </section>

      {/* WHAT THE STOCK SCANNER DOES */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Core Engine Mechanics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            What The Stock Scanner Does
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            Derived directly from the Python backend repository algorithms, combining Japanese equilibrium principles with candlestick momentum confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">The 5 Ichimoku Lines</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Computes <span className="text-cyan-300 font-semibold">Tenkan-sen (9)</span> and <span className="text-rose-300 font-semibold">Kijun-sen (26)</span> for short & medium term momentum, projected ahead via <span className="text-emerald-300 font-semibold">Senkou Span A/B</span>, verified by the lagging <span className="text-purple-300 font-semibold">Chikou Span</span>.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Kumo Cloud Breakouts</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Measures cloud thickness and position. A price closing above a wide green cloud provides statistical trend stability, while thin clouds alert you to rapid reversal vulnerabilities.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Candlestick Kickers</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Python scanner scans for high-momentum <span className="text-amber-300 font-medium">Kicker reversal patterns</span> where a stock opens with a gap in the opposite direction on elevated volume.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Timeframe Scoring</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Calculates a composite score from <span className="text-white font-mono font-bold">-5 to +5</span> across Daily, Weekly, and Monthly charts, ensuring you trade strictly with the higher-timeframe tide.
            </p>
          </div>
        </div>
      </section>

      {/* WHY THIS SITE BENEFITS USERS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              User Benefits
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Why Traders & Investors Benefit From This Platform
            </h2>
            <p className="mt-2 text-slate-400 text-base">
              Moving beyond static tables to an interactive personal command center built for speed, precision, and zero noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex-shrink-0 flex items-center justify-center text-cyan-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Zero Chart Fatigue</h4>
                <p className="text-sm text-slate-400">
                  Instead of manually flipping through 500 individual stock charts every evening, the scanner sifts through the noise in seconds and bubbles up only stocks with confirmed Ichimoku alignment.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Personalized Watchlists</h4>
                <p className="text-sm text-slate-400">
                  Save your specific holdings and targets into distinct watchlists (e.g. "Tech Leaders", "Swing Breakouts") so you never waste time tracking assets you don't trade.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex-shrink-0 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Instant Real-Time Alerts</h4>
                <p className="text-sm text-slate-400">
                  Set rule triggers for Bullish TK crosses, price breaking out of the Kumo cloud, or kicker signals. Receive instant on-screen, sound, or notification alerts when conditions trigger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE SCANNER PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>Live Scanner Highlights</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Click any stock to inspect Ichimoku chart
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Real-time calculations corresponding to your Python scanner algorithms
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('TOP_SCORE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'TOP_SCORE'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Strength +4/+5
            </button>
            <button
              onClick={() => setActiveFilter('KICKER')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'KICKER'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kicker Signals
            </button>
            <button
              onClick={() => setActiveFilter('BULLISH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'BULLISH'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bullish Cloud
            </button>
          </div>
        </div>

        {/* Preview Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticker / Name</th>
                <th className="py-3 px-4">Price / 1D</th>
                <th className="py-3 px-4">Ichimoku Cloud</th>
                <th className="py-3 px-4">TK Cross State</th>
                <th className="py-3 px-4">Kicker</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPreview.map(stock => {
                const inWatchlist = isTickerInWatchlist(activeWatchlistId, stock.ticker);

                return (
                  <tr
                    key={stock.ticker}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectStock(stock)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-mono text-base">{stock.ticker}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {stock.index}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">{stock.name}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
                      <div className={`text-xs ${stock.change1D >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.change1D >= 0 ? '+' : ''}{stock.change1D}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {stock.cloudStatus === 'ABOVE_CLOUD' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Above Green Cloud
                        </span>
                      )}
                      {stock.cloudStatus === 'IN_CLOUD' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950/60 text-amber-400 border border-amber-500/30">
                          In Cloud (Chop)
                        </span>
                      )}
                      {stock.cloudStatus === 'BELOW_CLOUD' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-500/30">
                          Below Red Cloud
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {stock.tkCross === 'BULLISH_CROSS' && (
                        <span className="text-xs font-medium text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tenkan &gt; Kijun</span>
                        </span>
                      )}
                      {stock.tkCross === 'BEARISH_CROSS' && (
                        <span className="text-xs font-medium text-rose-400">
                          Tenkan &lt; Kijun
                        </span>
                      )}
                      {stock.tkCross === 'NEUTRAL' && (
                        <span className="text-xs text-slate-400">Neutral</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {stock.kickerSignal === 'BULLISH_KICKER' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1 w-max">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Bullish Kicker</span>
                        </span>
                      ) : stock.kickerSignal === 'BEARISH_KICKER' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Bearish Kicker
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                          stock.strengthScore >= 4
                            ? 'bg-emerald-500 text-slate-950'
                            : stock.strengthScore >= 2
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : stock.strengthScore <= -3
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {stock.strengthScore > 0 ? `+${stock.strengthScore}` : stock.strengthScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectStock(stock)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1"
                        >
                          <LineChart className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Chart</span>
                        </button>
                        <button
                          onClick={() => addTickerToWatchlist(activeWatchlistId, stock.ticker)}
                          disabled={inWatchlist}
                          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                            inWatchlist
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                          title={inWatchlist ? 'Already in Watchlist' : 'Add to Watchlist'}
                        >
                          {inWatchlist ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onExploreScanner}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            <span>View Full Market Scanner with all indices & filters</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
