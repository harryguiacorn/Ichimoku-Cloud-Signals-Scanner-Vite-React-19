import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Layers,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus,
  Flame,
  Info,
  Calendar,
  Share2
} from 'lucide-react';
import { StockConstituent, CandleData } from '../types';
import { useAuth } from '../context/AuthContext';

interface IchimokuChartModalProps {
  stock: StockConstituent;
  onClose: () => void;
  onOpenAlertModal: (ticker: string) => void;
}

export const IchimokuChartModal: React.FC<IchimokuChartModalProps> = ({
  stock,
  onClose,
  onOpenAlertModal,
}) => {
  const { addTickerToWatchlist, activeWatchlistId, isTickerInWatchlist } = useAuth();
  const inWatchlist = isTickerInWatchlist(activeWatchlistId, stock.ticker);

  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1D');
  const [showTenkan, setShowTenkan] = useState(true);
  const [showKijun, setShowKijun] = useState(true);
  const [showCloud, setShowCloud] = useState(true);
  const [showChikou, setShowChikou] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  const candles = stock.historicalCandles || [];

  // Chart dimension calculations
  const width = 740;
  const height = 340;
  const padding = { top: 20, right: 65, bottom: 30, left: 15 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute min/max for scale
  const { minPrice, maxPrice } = useMemo(() => {
    if (candles.length === 0) return { minPrice: stock.price * 0.9, maxPrice: stock.price * 1.1 };
    let min = Infinity;
    let max = -Infinity;
    candles.forEach(c => {
      min = Math.min(min, c.low);
      max = Math.max(max, c.high);
      if (c.senkouSpanA) {
        min = Math.min(min, c.senkouSpanA);
        max = Math.max(max, c.senkouSpanA);
      }
      if (c.senkouSpanB) {
        min = Math.min(min, c.senkouSpanB);
        max = Math.max(max, c.senkouSpanB);
      }
    });
    // Add 4% margin
    const margin = (max - min) * 0.04 || 2;
    return { minPrice: min - margin, maxPrice: max + margin };
  }, [candles, stock.price]);

  const getY = (val: number) => {
    return innerHeight - ((val - minPrice) / (maxPrice - minPrice)) * innerHeight + padding.top;
  };

  const getX = (idx: number) => {
    return padding.left + (idx / Math.max(1, candles.length - 1)) * innerWidth;
  };

  // Build polygon path for the Kumo Cloud
  const kumoCloudPaths = useMemo(() => {
    const greenSegments: string[] = [];
    const redSegments: string[] = [];

    for (let i = 0; i < candles.length - 1; i++) {
      const c1 = candles[i];
      const c2 = candles[i + 1];

      if (c1.senkouSpanA === undefined || c1.senkouSpanB === undefined) continue;
      if (c2.senkouSpanA === undefined || c2.senkouSpanB === undefined) continue;

      const x1 = getX(i);
      const x2 = getX(i + 1);
      const y1A = getY(c1.senkouSpanA);
      const y2A = getY(c2.senkouSpanA);
      const y1B = getY(c1.senkouSpanB);
      const y2B = getY(c2.senkouSpanB);

      const path = `M ${x1} ${y1A} L ${x2} ${y2A} L ${x2} ${y2B} L ${x1} ${y1B} Z`;

      const isBullish = c2.senkouSpanA >= c2.senkouSpanB;
      if (isBullish) {
        greenSegments.push(path);
      } else {
        redSegments.push(path);
      }
    }

    return { green: greenSegments.join(' '), red: redSegments.join(' ') };
  }, [candles, minPrice, maxPrice]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xl">
              {stock.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-white font-mono">{stock.ticker}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {stock.index}
                </span>
                <span className="text-xs text-slate-400">• {stock.sector}</span>
              </div>
              <p className="text-xs text-slate-400">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenAlertModal(stock.ticker)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert</span>
            </button>

            <button
              onClick={() => addTickerToWatchlist(activeWatchlistId, stock.ticker)}
              disabled={inWatchlist}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                inWatchlist
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400'
              }`}
            >
              {inWatchlist ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{inWatchlist ? 'Watchlist Saved' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Metrics Strip */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-slate-500 mr-2">LAST:</span>
              <span className="text-lg font-bold text-white">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-semibold ${stock.change1D >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stock.change1D >= 0 ? '+' : ''}{stock.change1D}%
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-500 mr-1.5">TENKAN:</span>
              <span className="text-cyan-400 font-semibold">${stock.ichimoku.tenkan.toFixed(2)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-500 mr-1.5">KIJUN:</span>
              <span className="text-rose-400 font-semibold">${stock.ichimoku.kijun.toFixed(2)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-500 mr-1.5">SPAN A:</span>
              <span className="text-emerald-400 font-semibold">${stock.ichimoku.senkouSpanA.toFixed(2)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-500 mr-1.5">SPAN B:</span>
              <span className="text-amber-400 font-semibold">${stock.ichimoku.senkouSpanB.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">STRENGTH:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                stock.strengthScore >= 4
                  ? 'bg-emerald-500 text-slate-950'
                  : stock.strengthScore <= -2
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-cyan-400'
              }`}
            >
              {stock.strengthScore > 0 ? `+${stock.strengthScore}` : stock.strengthScore} / 5
            </span>
          </div>
        </div>

        {/* Chart Controls & Indicator Toggles */}
        <div className="px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Timeframe */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['1D', '1W', '1M'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-mono font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center space-x-3 text-slate-300">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showTenkan}
                onChange={e => setShowTenkan(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span className="text-cyan-400 font-mono">Tenkan (9)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showKijun}
                onChange={e => setShowKijun(e.target.checked)}
                className="accent-rose-400 rounded"
              />
              <span className="text-rose-400 font-mono">Kijun (26)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCloud}
                onChange={e => setShowCloud(e.target.checked)}
                className="accent-emerald-400 rounded"
              />
              <span className="text-emerald-400 font-mono">Kumo Cloud</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showChikou}
                onChange={e => setShowChikou(e.target.checked)}
                className="accent-purple-400 rounded"
              />
              <span className="text-purple-400 font-mono">Chikou (26)</span>
            </label>
          </div>
        </div>

        {/* SVG Japanese Candlestick & Ichimoku Chart */}
        <div className="p-4 sm:p-6 bg-slate-950/80 relative">
          {/* Hover HUD overlay */}
          {hoveredCandle && (
            <div className="absolute top-8 left-8 z-10 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 font-mono text-[11px] text-slate-300 flex flex-wrap gap-3 shadow-lg">
              <span>Date: <b className="text-white">{hoveredCandle.date}</b></span>
              <span>O: <b className="text-white">${hoveredCandle.open}</b></span>
              <span>H: <b className="text-white">${hoveredCandle.high}</b></span>
              <span>L: <b className="text-white">${hoveredCandle.low}</b></span>
              <span>C: <b className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${hoveredCandle.close}</b></span>
              {hoveredCandle.tenkan && <span>Tenkan: <b className="text-cyan-400">${hoveredCandle.tenkan}</b></span>}
              {hoveredCandle.kijun && <span>Kijun: <b className="text-rose-400">${hoveredCandle.kijun}</b></span>}
            </div>
          )}

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[380px] select-none"
              onMouseLeave={() => setHoveredCandle(null)}
            >
              <defs>
                <linearGradient id="bullishKumo" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="bearishKumo" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding.top + ratio * innerHeight;
                const priceAtY = maxPrice - ratio * (maxPrice - minPrice);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={width - padding.right + 8}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      ${priceAtY.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Kumo Cloud */}
              {showCloud && (
                <>
                  <path d={kumoCloudPaths.green} fill="url(#bullishKumo)" />
                  <path d={kumoCloudPaths.red} fill="url(#bearishKumo)" />
                </>
              )}

              {/* Senkou Span A line */}
              {showCloud && (
                <path
                  d={candles
                    .map((c, i) => (c.senkouSpanA ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.senkouSpanA)}` : ''))
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />
              )}

              {/* Senkou Span B line */}
              {showCloud && (
                <path
                  d={candles
                    .map((c, i) => (c.senkouSpanB ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.senkouSpanB)}` : ''))
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />
              )}

              {/* Chikou Span (purple) */}
              {showChikou && (
                <path
                  d={candles
                    .map((c, i) => (c.chikou ? `${i === 0 ? 'M' : 'L'} ${getX(Math.max(0, i - 12))} ${getY(c.chikou)}` : ''))
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}

              {/* Candlesticks */}
              {candles.map((c, i) => {
                const x = getX(i);
                const isGreen = c.close >= c.open;
                const candleColor = isGreen ? '#10b981' : '#f43f5e';
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const bodyY = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
                const candleWidth = Math.max(3, innerWidth / (candles.length * 1.6));

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredCandle(c)}
                    className="cursor-crosshair"
                  >
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyY}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Kijun-sen (Coral/Red, 26 period) */}
              {showKijun && (
                <path
                  d={candles
                    .map((c, i) => (c.kijun ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.kijun)}` : ''))
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="2"
                />
              )}

              {/* Tenkan-sen (Cyan, 9 period) */}
              {showTenkan && (
                <path
                  d={candles
                    .map((c, i) => (c.tenkan ? `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.tenkan)}` : ''))
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Technical Signals & Python Scanner Breakdown */}
        <div className="p-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>TK Cross Alignment</span>
            </div>
            <div className="text-base font-bold text-white mb-1">
              {stock.tkCross === 'BULLISH_CROSS' ? 'Bullish Tenkan Cross' : stock.tkCross === 'BEARISH_CROSS' ? 'Bearish Tenkan Cross' : 'Neutral Equilibrium'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tenkan-sen ($ {stock.ichimoku.tenkan}) is currently {stock.tkDistancePercent > 0 ? '+' : ''}{stock.tkDistancePercent}% away from Kijun-sen ($ {stock.ichimoku.kijun}).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-2">
              <Layers className="w-4 h-4" />
              <span>Kumo Cloud Envelope</span>
            </div>
            <div className="text-base font-bold text-white mb-1">
              {stock.cloudStatus === 'ABOVE_CLOUD' ? 'Trading Above Kumo' : stock.cloudStatus === 'IN_CLOUD' ? 'Inside Cloud (Turbulent)' : 'Sub-Cloud Downtrend'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cloud is {stock.ichimoku.cloudColor === 'BULLISH_GREEN' ? 'Green (Bullish)' : 'Red (Bearish)'} with thickness of {stock.ichimoku.cloudThickness} pts providing dynamic support.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-2">
              <Flame className="w-4 h-4" />
              <span>Candlestick Kicker</span>
            </div>
            <div className="text-base font-bold text-white mb-1">
              {stock.kickerSignal === 'BULLISH_KICKER' ? 'Confirmed Bullish Kicker' : stock.kickerSignal === 'BEARISH_KICKER' ? 'Confirmed Bearish Kicker' : 'No Kicker Today'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {stock.kickerSignal !== 'NONE'
                ? 'High-conviction gap reversal confirmed by Python volume scanner.'
                : 'Standard price progression within normal candle range.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
