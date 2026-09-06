import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Volume2,
  Mail,
  Zap,
  Flame,
  TrendingUp,
  Layers,
  LineChart,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { StockConstituent, AlertTrigger, SignalType } from '../types';
import { useAuth } from '../context/AuthContext';

interface AlertsManagerProps {
  stocks: StockConstituent[];
  preselectedTicker?: string;
  onSelectStock: (stock: StockConstituent) => void;
  isOpenAsModal?: boolean;
  onClose?: () => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  stocks,
  preselectedTicker,
  onSelectStock,
  isOpenAsModal = false,
  onClose
}) => {
  const {
    alerts,
    notifications,
    createAlert,
    toggleAlert,
    deleteAlert,
    clearNotifications,
    triggerMockAlert,
    liveSimulationActive,
    setLiveSimulationActive
  } = useAuth();

  const [ticker, setTicker] = useState<string>(preselectedTicker || stocks[0]?.ticker || 'NVDA');
  const [condition, setCondition] = useState<AlertTrigger['condition']>('TK_BULLISH_CROSS');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    createAlert(ticker, condition, targetPrice ? parseFloat(targetPrice) : undefined);
    setTargetPrice('');
  };

  const handleSimulateInstant = () => {
    const randomStock = stocks[Math.floor(Math.random() * stocks.length)] || stocks[0];
    const isBull = randomStock.strengthScore >= 0;
    triggerMockAlert(
      randomStock.ticker,
      isBull ? 'Simulated: Bullish TK Cross Alert' : 'Simulated: Bearish Kumo Breakdown Alert',
      isBull
        ? `Tenkan-sen ($${randomStock.ichimoku.tenkan.toFixed(2)}) crossed above Kijun ($${randomStock.ichimoku.kijun.toFixed(2)}) above Kumo.`
        : `Price penetrated below lower Senkou Span B support ($${randomStock.ichimoku.senkouSpanB.toFixed(2)}).`,
      isBull ? 'STRONG_BULLISH' : 'STRONG_BEARISH',
      randomStock.price
    );
  };

  const content = (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-white">Real-Time Ichimoku Alert Engine</h2>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Engine Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts dispatched when Tenkan crosses Kijun, Kumo clouds break, or Candlestick Kickers ignite.
          </p>
        </div>

        {/* Live Simulator Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateInstant}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700 shadow-sm"
            title="Fire a sample signal right now"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Trigger Signal</span>
          </button>

          <button
            onClick={() => setLiveSimulationActive(!liveSimulationActive)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              liveSimulationActive
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            Feed: {liveSimulationActive ? 'Auto-Streaming ON' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'rules'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Active Alert Rules ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Signal History ({notifications.length})
        </button>
      </div>

      {activeTab === 'rules' ? (
        <div className="space-y-6">
          {/* Create Alert Rule Form */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Create New Alert Trigger</span>
            </h3>

            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Select Stock */}
              <div>
                <label className="block text-slate-400 font-mono mb-1">Target Stock / Index</label>
                <select
                  value={ticker}
                  onChange={e => setTicker(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  {stocks.map(s => (
                    <option key={s.ticker} value={s.ticker}>
                      {s.ticker} - {s.name} ({s.index})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Condition */}
              <div>
                <label className="block text-slate-400 font-mono mb-1">Signal Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as AlertTrigger['condition'])}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="TK_BULLISH_CROSS">TK Bullish Cross (Tenkan &gt; Kijun)</option>
                  <option value="TK_BEARISH_CROSS">TK Bearish Cross (Tenkan &lt; Kijun)</option>
                  <option value="KUMO_BREAKOUT_ABOVE">Kumo Breakout (Close Above Cloud)</option>
                  <option value="KUMO_BREAKDOWN_BELOW">Kumo Breakdown (Close Below Cloud)</option>
                  <option value="BULLISH_KICKER">Candlestick Bullish Kicker</option>
                  <option value="BEARISH_KICKER">Candlestick Bearish Kicker</option>
                  <option value="STRENGTH_SCORE_GTE">Strength Score ≥ +4</option>
                  <option value="PRICE_ABOVE">Price Closes Above Target</option>
                  <option value="PRICE_BELOW">Price Closes Below Target</option>
                </select>
              </div>

              {/* Target Price (if applicable) */}
              <div>
                <label className="block text-slate-400 font-mono mb-1">Target Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Activate Rule</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Rules List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">Configured Rules</h4>
            {alerts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                No active alert rules configured. Use the form above to add your first Ichimoku trigger.
              </div>
            ) : (
              alerts.map(alt => {
                const stockInfo = stocks.find(s => s.ticker === alt.ticker);

                return (
                  <div
                    key={alt.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      alt.active ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleAlert(alt.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          alt.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}
                        title={alt.active ? 'Disable Rule' : 'Enable Rule'}
                      >
                        {alt.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white font-mono text-base">{alt.ticker}</span>
                          <span className="text-xs text-slate-400">{stockInfo?.name}</span>
                        </div>
                        <div className="text-xs text-cyan-400 font-mono mt-0.5">
                          Trigger: <span className="text-slate-200">{alt.condition.replace(/_/g, ' ')}</span>
                          {alt.targetValue && ` ($${alt.targetValue})`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto text-xs font-mono text-slate-400">
                      {alt.lastTriggered && (
                        <span className="text-slate-500">Last: {alt.lastTriggered}</span>
                      )}
                      {stockInfo && (
                        <button
                          onClick={() => onSelectStock(stockInfo)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                        >
                          <LineChart className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Chart</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alt.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">Live Dispatched Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No signal notifications recorded yet. Keep the live scanner running or trigger a test signal.
              </div>
            ) : (
              notifications.map(notif => {
                const stock = stocks.find(s => s.ticker === notif.ticker);

                return (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-cyan-400 font-mono">{notif.ticker}</span>
                          <span className="text-xs font-semibold text-white">{notif.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">{notif.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto font-mono text-xs">
                      <span className="text-slate-400">Trigger: ${notif.priceAtTrigger.toFixed(2)}</span>
                      {stock && (
                        <button
                          onClick={() => onSelectStock(stock)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
                        >
                          <LineChart className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Chart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {content}
    </div>
  );
};
