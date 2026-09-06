import React, { useState } from 'react';
import {
  ListPlus,
  Trash2,
  TrendingUp,
  Plus,
  LineChart,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Search,
  Sliders,
  ShieldCheck,
  Zap,
  FolderPlus
} from 'lucide-react';
import { StockConstituent } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserWatchlistDashboardProps {
  stocks: StockConstituent[];
  onSelectStock: (stock: StockConstituent) => void;
  onOpenAlertModal: (ticker: string) => void;
  onOpenAuthModal: () => void;
}

export const UserWatchlistDashboard: React.FC<UserWatchlistDashboardProps> = ({
  stocks,
  onSelectStock,
  onOpenAlertModal,
  onOpenAuthModal
}) => {
  const {
    user,
    isAuthenticated,
    isGuest,
    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    createWatchlist,
    deleteWatchlist,
    addTickerToWatchlist,
    removeTickerFromWatchlist
  } = useAuth();

  const [newListName, setNewListName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickAddSearch, setQuickAddSearch] = useState('');
  const [quickAddDropdownOpen, setQuickAddDropdownOpen] = useState(false);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  // Resolve stock items in this watchlist
  const watchlistStocks = (activeWatchlist?.tickers || [])
    .map(ticker => stocks.find(s => s.ticker === ticker))
    .filter(Boolean) as StockConstituent[];

  // Quick performance stats for current watchlist
  const avgScore =
    watchlistStocks.length > 0
      ? (watchlistStocks.reduce((acc, s) => acc + s.strengthScore, 0) / watchlistStocks.length).toFixed(1)
      : '0.0';

  const bullishPercent =
    watchlistStocks.length > 0
      ? Math.round(
          (watchlistStocks.filter(s => s.cloudStatus === 'ABOVE_CLOUD').length / watchlistStocks.length) * 100
        )
      : 0;

  const bestPerformer = [...watchlistStocks].sort((a, b) => b.change1D - a.change1D)[0];

  // Filter stocks for quick-add dropdown
  const availableToAdd = stocks.filter(
    s =>
      !activeWatchlist?.tickers.includes(s.ticker) &&
      (s.ticker.toLowerCase().includes(quickAddSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(quickAddSearch.toLowerCase()))
  );

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createWatchlist(newListName.trim());
    setNewListName('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome / Auth Alert Banner */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Create an account or use Demo Trader</h4>
              <p className="text-xs text-slate-300">
                Sign in to persist your customized watchlists, custom Ichimoku parameters, and real-time alert rules across devices.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors self-start sm:self-auto"
          >
            Register / Log In
          </button>
        </div>
      )}

      {/* Dashboard Header & Watchlist Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Personalized Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono">
              {watchlistStocks.length} Stocks Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-timeframe Ichimoku cloud envelopes and receive immediate alerts for your portfolio.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start md:self-auto shadow-sm"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Watchlist</span>
        </button>
      </div>

      {/* Watchlist Tabs Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {watchlists.map(wl => (
          <div key={wl.id} className="relative group flex items-center flex-shrink-0">
            <button
              onClick={() => setActiveWatchlistId(wl.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                wl.id === activeWatchlistId
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{wl.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  wl.id === activeWatchlistId ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {wl.tickers.length}
              </span>
            </button>

            {watchlists.length > 1 && !wl.isDefault && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteWatchlist(wl.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity ml-1"
                title="Delete this watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Watchlist Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Average Strength Score</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {Number(avgScore) > 0 ? `+${avgScore}` : avgScore} / 5
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across Daily, Weekly & Monthly signals</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Above Green Cloud</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{bullishPercent}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bullish Kumo trend conformation</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Top Performer (1D)</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {bestPerformer ? `${bestPerformer.ticker} (+${bestPerformer.change1D}%)` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {bestPerformer ? bestPerformer.name : 'Add stocks to calculate'}
          </div>
        </div>
      </div>

      {/* Quick Add Search Bar */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Add stock to "${activeWatchlist?.name}" (e.g. AAPL, NVDA, TSLA, GC=F)...`}
              value={quickAddSearch}
              onChange={e => {
                setQuickAddSearch(e.target.value);
                setQuickAddDropdownOpen(true);
              }}
              onFocus={() => setQuickAddDropdownOpen(true)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          {quickAddDropdownOpen && quickAddSearch && (
            <button
              onClick={() => {
                setQuickAddSearch('');
                setQuickAddDropdownOpen(false);
              }}
              className="px-3 py-2.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Add Dropdown */}
        {quickAddDropdownOpen && quickAddSearch && (
          <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {availableToAdd.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching stocks found or stock already in this watchlist.
              </div>
            ) : (
              availableToAdd.slice(0, 6).map(stock => (
                <div
                  key={stock.ticker}
                  className="p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-white font-mono">{stock.ticker}</span>
                    <span className="text-xs text-slate-400">{stock.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {stock.index}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      addTickerToWatchlist(activeWatchlistId, stock.ticker);
                      setQuickAddSearch('');
                      setQuickAddDropdownOpen(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to List</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Watchlist Stock Cards / Table */}
      {watchlistStocks.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <ListPlus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Use the search bar above or explore the Market Scanner to add high-conviction stocks and track their Ichimoku Cloud signals.
          </p>
          <button
            onClick={() => {
              // Add a sample of 3 top stocks
              ['NVDA', 'AAPL', 'MSFT'].forEach(t => addTickerToWatchlist(activeWatchlistId, t));
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold"
          >
            Add Popular Tech Leaders (NVDA, AAPL, MSFT)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlistStocks.map(stock => (
            <div
              key={stock.ticker}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-extrabold text-white font-mono">{stock.ticker}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {stock.index}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{stock.name}</p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeTickerFromWatchlist(activeWatchlistId, stock.ticker)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from this watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price and Day Change */}
                <div className="mt-4 flex items-baseline justify-between font-mono">
                  <span className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</span>
                  <span
                    className={`text-sm font-semibold ${
                      stock.change1D >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stock.change1D >= 0 ? '+' : ''}{stock.change1D}%
                  </span>
                </div>

                {/* Ichimoku Cloud Status Pill */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cloud Envelope:</span>
                  {stock.cloudStatus === 'ABOVE_CLOUD' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      Above Cloud
                    </span>
                  )}
                  {stock.cloudStatus === 'IN_CLOUD' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-400 border border-amber-500/30">
                      Inside Cloud
                    </span>
                  )}
                  {stock.cloudStatus === 'BELOW_CLOUD' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/60 text-rose-400 border border-rose-500/30">
                      Below Cloud
                    </span>
                  )}
                </div>

                {/* Tenkan / Kijun info */}
                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Tenkan / Kijun:</span>
                  <span className="text-slate-300">
                    <b className="text-cyan-400">${stock.ichimoku.tenkan}</b> / <b className="text-rose-400">${stock.ichimoku.kijun}</b>
                  </span>
                </div>

                {/* Strength Score & Kicker */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Strength Score:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      stock.strengthScore >= 4
                        ? 'bg-emerald-500 text-slate-950'
                        : stock.strengthScore <= -2
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {stock.strengthScore > 0 ? `+${stock.strengthScore}` : stock.strengthScore} / 5
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectStock(stock)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <LineChart className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Chart</span>
                </button>

                <button
                  onClick={() => onOpenAlertModal(stock.ticker)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                  title="Configure alert triggers"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create New Watchlist</h3>
            <p className="text-xs text-slate-400 mb-4">
              Organize your holdings, prospective breakout candidates, or swing setups into separate radar lists.
            </p>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Watchlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Breakout Radars, FTSE Dividend Tech..."
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                >
                  Create Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
