import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  Layers,
  Flame,
  CheckCircle2,
  Plus,
  Bell,
  LineChart,
  ArrowUpDown,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { StockConstituent, MarketIndex, CloudStatus, KickerType } from '../types';
import { useAuth } from '../context/AuthContext';
import { Pagination } from './Pagination';

interface MarketScannerTableProps {
  stocks: StockConstituent[];
  onSelectStock: (stock: StockConstituent) => void;
  onOpenAlertModal: (ticker: string) => void;
}

export const MarketScannerTable: React.FC<MarketScannerTableProps> = ({
  stocks,
  onSelectStock,
  onOpenAlertModal,
}) => {
  const { watchlists, activeWatchlistId, addTickerToWatchlist, isTickerInWatchlist } = useAuth();

  const [selectedIndex, setSelectedIndex] = useState<MarketIndex | 'ALL'>('ALL');
  const [selectedCloud, setSelectedCloud] = useState<CloudStatus | 'ALL'>('ALL');
  const [selectedKicker, setSelectedKicker] = useState<KickerType | 'ALL'>('ALL');
  const [selectedTkCross, setSelectedTkCross] = useState<'ALL' | 'BULLISH_CROSS' | 'BEARISH_CROSS'>('ALL');
  const [minScore, setMinScore] = useState<number>(-5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'score' | 'change1D' | 'price' | 'ticker'>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination state: default 25 rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIndex, selectedCloud, selectedKicker, selectedTkCross, minScore]);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTicker = stock.ticker.toLowerCase().includes(q);
        const matchName = stock.name.toLowerCase().includes(q);
        const matchSector = stock.sector.toLowerCase().includes(q);
        if (!matchTicker && !matchName && !matchSector) return false;
      }

      // Index
      if (selectedIndex !== 'ALL' && stock.index !== selectedIndex) return false;

      // Cloud
      if (selectedCloud !== 'ALL' && stock.cloudStatus !== selectedCloud) return false;

      // Kicker
      if (selectedKicker !== 'ALL' && stock.kickerSignal !== selectedKicker) return false;

      // TK Cross
      if (selectedTkCross !== 'ALL' && stock.tkCross !== selectedTkCross) return false;

      // Min score
      if (stock.strengthScore < minScore) return false;

      return true;
    });
  }, [stocks, searchQuery, selectedIndex, selectedCloud, selectedKicker, selectedTkCross, minScore]);

  // Sort stocks
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let valA: string | number = a.ticker;
      let valB: string | number = b.ticker;

      if (sortField === 'score') {
        valA = a.strengthScore;
        valB = b.strengthScore;
      } else if (sortField === 'change1D') {
        valA = a.change1D;
        valB = b.change1D;
      } else if (sortField === 'price') {
        valA = a.price;
        valB = b.price;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredStocks, sortField, sortAsc]);

  // Paginated stocks for current page
  const paginatedStocks = useMemo(() => {
    if (sortedStocks.length <= 25 && pageSize === 25) return sortedStocks;
    const start = (currentPage - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [sortedStocks, currentPage, pageSize]);

  const handleSort = (field: 'score' | 'change1D' | 'price' | 'ticker') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Summary counts
  const bullishCount = stocks.filter(s => s.strengthScore >= 3).length;
  const kickersCount = stocks.filter(s => s.kickerSignal !== 'NONE').length;
  const aboveCloudCount = stocks.filter(s => s.cloudStatus === 'ABOVE_CLOUD').length;

  const exportCSV = () => {
    const headers = ['Ticker', 'Name', 'Index', 'Sector', 'Price', '1D_Change', 'Strength_Score', 'Cloud_Status', 'TK_Cross', 'Kicker'];
    const rows = sortedStocks.map(s => [
      s.ticker,
      `"${s.name}"`,
      s.index,
      `"${s.sector}"`,
      s.price,
      `${s.change1D}%`,
      s.strengthScore,
      s.cloudStatus,
      s.tkCross,
      s.kickerSignal
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ichimoku_scanner_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Constituents Scanned</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{stocks.length}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">S&P, Nasdaq, Dow, FTSE, Futures</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Strong Bullish (Score ≥ +3)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{bullishCount}</div>
          <div className="text-[11px] text-emerald-500 mt-0.5">High Probability Setups</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Candlestick Kickers</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{kickersCount}</div>
          <div className="text-[11px] text-amber-400 mt-0.5">Momentum Gap Reversals</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">Above Kumo Cloud</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-1">{aboveCloudCount}</div>
          <div className="text-[11px] text-sky-500 mt-0.5">Dynamic Cloud Support</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, company name, or sector (e.g. NVDA, Apple, Tech)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Export and Reset */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Download results as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                setSelectedIndex('ALL');
                setSelectedCloud('ALL');
                setSelectedKicker('ALL');
                setSelectedTkCross('ALL');
                setMinScore(-5);
                setSearchQuery('');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Index Pill Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-500 mr-1">Index:</span>
          {(['ALL', 'SP500', 'NASDAQ100', 'DOW30', 'FTSE100', 'FUTURES', 'FOREX'] as const).map(idx => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedIndex === idx
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
              }`}
            >
              {idx === 'ALL' ? 'All Markets' : idx}
            </button>
          ))}
        </div>

        {/* Granular Ichimoku & Kicker Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 text-xs">
          {/* Cloud Position */}
          <div>
            <label className="block text-slate-500 font-mono mb-1">Cloud Envelope:</label>
            <select
              value={selectedCloud}
              onChange={e => setSelectedCloud(e.target.value as CloudStatus | 'ALL')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Cloud States</option>
              <option value="ABOVE_CLOUD">Above Green Cloud</option>
              <option value="IN_CLOUD">Inside Cloud (Chop)</option>
              <option value="BELOW_CLOUD">Below Red Cloud</option>
            </select>
          </div>

          {/* TK Cross */}
          <div>
            <label className="block text-slate-500 font-mono mb-1">Tenkan / Kijun State:</label>
            <select
              value={selectedTkCross}
              onChange={e => setSelectedTkCross(e.target.value as 'ALL' | 'BULLISH_CROSS' | 'BEARISH_CROSS')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All TK Crosses</option>
              <option value="BULLISH_CROSS">Bullish Cross (Tenkan &gt; Kijun)</option>
              <option value="BEARISH_CROSS">Bearish Cross (Tenkan &lt; Kijun)</option>
            </select>
          </div>

          {/* Kicker Pattern */}
          <div>
            <label className="block text-slate-500 font-mono mb-1">Candlestick Kicker:</label>
            <select
              value={selectedKicker}
              onChange={e => setSelectedKicker(e.target.value as KickerType | 'ALL')}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Signals</option>
              <option value="BULLISH_KICKER">Bullish Kicker Only</option>
              <option value="BEARISH_KICKER">Bearish Kicker Only</option>
            </select>
          </div>

          {/* Min Strength Score Slider */}
          <div>
            <div className="flex justify-between text-slate-500 font-mono mb-1">
              <span>Min Score:</span>
              <span className="text-cyan-400 font-bold">{minScore >= 0 ? `+${minScore}` : minScore}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="1"
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Main Scanner Results Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/95 text-xs font-mono uppercase text-slate-400 border-b border-slate-800 sticky top-0 z-10 backdrop-blur">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center space-x-1">
                  <span>Ticker / Security</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price / 1D %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Tenkan (9) / Kijun (26)</th>
              <th className="py-3 px-4">Cloud Envelope</th>
              <th className="py-3 px-4">Kicker Signal</th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-white"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Composite Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedStocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                  No stocks match the selected filters. Try resetting the filters or lowering the minimum score.
                </td>
              </tr>
            ) : (
              paginatedStocks.map(stock => {
                const inWatchlist = isTickerInWatchlist(activeWatchlistId, stock.ticker);

                return (
                  <tr
                    key={stock.ticker}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    {/* Ticker & Index */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-mono text-base">{stock.ticker}</span>
                        <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {stock.index}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[170px]">{stock.name}</div>
                    </td>

                    {/* Price & Day Change */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
                      <div className={`text-xs ${stock.change1D >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.change1D >= 0 ? '+' : ''}{stock.change1D}%
                      </div>
                    </td>

                    {/* Tenkan / Kijun */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400">T: ${stock.ichimoku.tenkan.toFixed(2)}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-rose-400">K: ${stock.ichimoku.kijun.toFixed(2)}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {stock.tkCross === 'BULLISH_CROSS' ? (
                          <span className="text-emerald-400">Tenkan &gt; Kijun (+{stock.tkDistancePercent}%)</span>
                        ) : stock.tkCross === 'BEARISH_CROSS' ? (
                          <span className="text-rose-400">Tenkan &lt; Kijun ({stock.tkDistancePercent}%)</span>
                        ) : (
                          'Equilibrium'
                        )}
                      </div>
                    </td>

                    {/* Cloud Envelope */}
                    <td className="py-3.5 px-4">
                      {stock.cloudStatus === 'ABOVE_CLOUD' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Above Green Cloud
                        </span>
                      )}
                      {stock.cloudStatus === 'IN_CLOUD' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950/60 text-amber-400 border border-amber-500/30">
                          Inside Cloud (Chop)
                        </span>
                      )}
                      {stock.cloudStatus === 'BELOW_CLOUD' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-500/30">
                          Below Red Cloud
                        </span>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        Thickness: {stock.ichimoku.cloudThickness} pts
                      </div>
                    </td>

                    {/* Kicker */}
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
                        <span className="text-xs text-slate-500 font-mono">—</span>
                      )}
                    </td>

                    {/* Composite Score */}
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
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        D:{stock.timeframeScores.daily} | W:{stock.timeframeScores.weekly} | M:{stock.timeframeScores.monthly}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectStock(stock)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1"
                          title="Open Interactive Ichimoku Chart"
                        >
                          <LineChart className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">Chart</span>
                        </button>

                        <button
                          onClick={() => onOpenAlertModal(stock.ticker)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 text-xs"
                          title="Set Price or TK Alert"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => addTickerToWatchlist(activeWatchlistId, stock.ticker)}
                          disabled={inWatchlist}
                          className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                            inWatchlist
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                          title={inWatchlist ? 'Already in Watchlist' : 'Add to Current Watchlist'}
                        >
                          {inWatchlist ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={sortedStocks.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[25, 50, 100]}
        itemLabel="stocks"
        sourceLabel="filtered"
      />
    </div>
  );
};
