import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  LineChart,
  Plus,
  CheckCircle2,
  Bell,
  Download,
  Filter,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CloudScanRow, StockConstituent } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTabulatorPageUrl, getGitHubRepoFileUrl } from '../services/githubCsvService';
import { Pagination } from './Pagination';

interface IchimokuCloudScanViewProps {
  rows: CloudScanRow[];
  selectedIndex: string;
  onSelectStock: (stock: StockConstituent) => void;
  onOpenAlertModal: (ticker: string) => void;
  unifiedStocks: StockConstituent[];
}

type SortField =
  | 'symbol'
  | 'name'
  | 'close'
  | 'cloud1H'
  | 'cloud1D'
  | 'cloud1W'
  | 'cloud1M'
  | 'cloudSum'
  | 'tkx1H'
  | 'tkx1D'
  | 'tkx1W'
  | 'tkx1M'
  | 'tkxSum'
  | 'totalScoreSum';

export const IchimokuCloudScanView: React.FC<IchimokuCloudScanViewProps> = ({
  rows,
  selectedIndex,
  onSelectStock,
  onOpenAlertModal,
  unifiedStocks
}) => {
  const { isTickerInWatchlist, addTickerToWatchlist } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH'>('ALL');
  const [cloudFilter, setCloudFilter] = useState<'ALL' | 'ABOVE' | 'BELOW'>('ALL');
  const [tkxFilter, setTkxFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [sortField, setSortField] = useState<SortField>('totalScoreSum');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination state: default 25 rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Reset to page 1 whenever filters, search, or index change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, scoreFilter, cloudFilter, tkxFilter, selectedIndex]);

  // Map of unified stocks for quick lookup to open chart/alerts
  const stockMap = useMemo(() => {
    const map = new Map<string, StockConstituent>();
    unifiedStocks.forEach(s => map.set(s.ticker.toUpperCase(), s));
    return map;
  }, [unifiedStocks]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSymbol = r.symbol.toLowerCase().includes(q);
        const matchName = r.name.toLowerCase().includes(q);
        if (!matchSymbol && !matchName) return false;
      }

      // Score filter
      if (scoreFilter === 'STRONG_BULLISH' && r.totalScoreSum < 300) return false;
      if (scoreFilter === 'BULLISH' && (r.totalScoreSum < 50 || r.totalScoreSum >= 300)) return false;
      if (scoreFilter === 'NEUTRAL' && (r.totalScoreSum < -50 || r.totalScoreSum > 50)) return false;
      if (scoreFilter === 'BEARISH' && (r.totalScoreSum > -50 || r.totalScoreSum <= -300)) return false;
      if (scoreFilter === 'STRONG_BEARISH' && r.totalScoreSum > -300) return false;

      // Cloud filter (1D)
      if (cloudFilter === 'ABOVE' && r.cloud1D <= 0) return false;
      if (cloudFilter === 'BELOW' && r.cloud1D >= 0) return false;

      // TKx filter (1D)
      if (tkxFilter === 'BULLISH' && r.tkx1D <= 0) return false;
      if (tkxFilter === 'BEARISH' && r.tkx1D >= 0) return false;

      return true;
    });
  }, [rows, searchQuery, scoreFilter, cloudFilter, tkxFilter]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      const numA = typeof valA === 'number' ? valA : 0;
      const numB = typeof valB === 'number' ? valB : 0;
      return sortAsc ? numA - numB : numB - numA;
    });
  }, [filteredRows, sortField, sortAsc]);

  // Paginated rows for the current page (25 rows default, or 50, 100)
  const paginatedRows = useMemo(() => {
    if (sortedRows.length <= 25 && pageSize === 25) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default to descending for scores
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  const formatScore = (val: number) => {
    if (val > 0) return `+${val}`;
    return `${val}`;
  };

  const getScoreColorClass = (val: number, isMajor = false) => {
    if (val > 150) return isMajor ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40' : 'text-emerald-300 font-semibold';
    if (val > 0) return isMajor ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium' : 'text-emerald-400';
    if (val < -150) return isMajor ? 'bg-rose-500/25 text-rose-300 font-bold border border-rose-500/40' : 'text-rose-300 font-semibold';
    if (val < 0) return isMajor ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-medium' : 'text-rose-400';
    return isMajor ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'text-slate-500';
  };

  const handleOpenChart = (symbol: string) => {
    const stock = stockMap.get(symbol.toUpperCase());
    if (stock) {
      onSelectStock(stock);
    }
  };

  // Quick stats
  const strongBullishCount = rows.filter(r => r.totalScoreSum >= 300).length;
  const bullishCount = rows.filter(r => r.totalScoreSum > 50 && r.totalScoreSum < 300).length;
  const bearishCount = rows.filter(r => r.totalScoreSum < -50).length;

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ticker or company name..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setScoreFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scoreFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => setScoreFilter('STRONG_BULLISH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scoreFilter === 'STRONG_BULLISH'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/40'
            }`}
          >
            🔥 Strong Bullish ({strongBullishCount})
          </button>
          <button
            onClick={() => setScoreFilter('BULLISH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scoreFilter === 'BULLISH'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ▲ Bullish ({bullishCount})
          </button>
          <button
            onClick={() => setScoreFilter('BEARISH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scoreFilter === 'BEARISH'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40'
            }`}
          >
            ▼ Bearish ({bearishCount})
          </button>
        </div>

        {/* External Scan Links */}
        <div className="flex items-center space-x-2">
          <a
            href={getTabulatorPageUrl(selectedIndex, 'sum')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-medium transition-colors"
            title="Open original Tabulator HTML view generated by GitHub Actions"
          >
            <span>Tabulator HTML</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Grouped Header */}
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th colSpan={3} className="py-2.5 px-4 text-left font-mono font-medium tracking-wider text-slate-400 border-r border-slate-800/60">
                  ASSET IDENTIFIERS
                </th>
                <th colSpan={5} className="py-2.5 px-4 text-center font-mono font-medium tracking-wider text-cyan-400 bg-cyan-950/20 border-r border-slate-800/60">
                  ICHIMOKU CLOUD (KUMO) STRENGTH SCORES
                </th>
                <th colSpan={5} className="py-2.5 px-4 text-center font-mono font-medium tracking-wider text-indigo-400 bg-indigo-950/20 border-r border-slate-800/60">
                  TENKAN / KIJUN CROSS (TKx) SCORES
                </th>
                <th colSpan={2} className="py-2.5 px-4 text-center font-mono font-medium tracking-wider text-emerald-400 bg-emerald-950/20">
                  TOTAL VERDICT & ACTIONS
                </th>
              </tr>

              {/* Column Specific Headers */}
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold select-none">
                {/* Symbol */}
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol</span>
                    {renderSortIndicator('symbol')}
                  </div>
                </th>

                {/* Name */}
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>

                {/* Close Price */}
                <th
                  onClick={() => handleSort('close')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors group border-r border-slate-800/60"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Close Price</span>
                    {renderSortIndicator('close')}
                  </div>
                </th>

                {/* Cloud Timeframes */}
                <th
                  onClick={() => handleSort('cloud1H')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="1-Hour Ichimoku Cloud Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1H Cloud</span>
                    {renderSortIndicator('cloud1H')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cloud1D')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="Daily Ichimoku Cloud Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1D Cloud</span>
                    {renderSortIndicator('cloud1D')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cloud1W')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="Weekly Ichimoku Cloud Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1W Cloud</span>
                    {renderSortIndicator('cloud1W')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cloud1M')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="Monthly Ichimoku Cloud Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1M Cloud</span>
                    {renderSortIndicator('cloud1M')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cloudSum')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors group font-bold bg-cyan-950/30 border-r border-slate-800/60"
                  title="Sum of all Cloud scores across all 4 timeframes"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Cloud Sum</span>
                    {renderSortIndicator('cloudSum')}
                  </div>
                </th>

                {/* TKx Timeframes */}
                <th
                  onClick={() => handleSort('tkx1H')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-indigo-300 transition-colors group"
                  title="1-Hour Tenkan/Kijun Cross Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1H TKx</span>
                    {renderSortIndicator('tkx1H')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tkx1D')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-indigo-300 transition-colors group"
                  title="Daily Tenkan/Kijun Cross Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1D TKx</span>
                    {renderSortIndicator('tkx1D')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tkx1W')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-indigo-300 transition-colors group"
                  title="Weekly Tenkan/Kijun Cross Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1W TKx</span>
                    {renderSortIndicator('tkx1W')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tkx1M')}
                  className="py-3 px-2.5 text-right cursor-pointer hover:text-indigo-300 transition-colors group"
                  title="Monthly Tenkan/Kijun Cross Score"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>1M TKx</span>
                    {renderSortIndicator('tkx1M')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tkxSum')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-300 transition-colors group font-bold bg-indigo-950/30 border-r border-slate-800/60"
                  title="Sum of all TKx cross scores across all 4 timeframes"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>TKx Sum</span>
                    {renderSortIndicator('tkxSum')}
                  </div>
                </th>

                {/* Total Score Sum */}
                <th
                  onClick={() => handleSort('totalScoreSum')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-emerald-300 transition-colors group font-bold bg-emerald-950/30"
                  title="Composite total score: Cloud Sum + TKx Sum"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Score Sum</span>
                    {renderSortIndicator('totalScoreSum')}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <p className="text-base font-medium">No constituents match your current filters.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting the search or filter threshold.</p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map(row => {
                  const inWatchlist = isTickerInWatchlist(row.symbol);
                  return (
                    <tr
                      key={row.symbol}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Symbol */}
                      <td className="py-2.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenChart(row.symbol)}
                            className="hover:text-cyan-400 transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Inspect Interactive Chart"
                          >
                            <span>{row.symbol}</span>
                            <LineChart className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4 text-slate-300 max-w-[200px] truncate" title={row.name}>
                        {row.name}
                      </td>

                      {/* Close Price */}
                      <td className="py-2.5 px-4 text-right font-mono text-slate-100 font-medium border-r border-slate-800/60">
                        ${row.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Cloud 1H */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.cloud1H)}`}>
                        {formatScore(row.cloud1H)}
                      </td>

                      {/* Cloud 1D */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.cloud1D)}`}>
                        {formatScore(row.cloud1D)}
                      </td>

                      {/* Cloud 1W */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.cloud1W)}`}>
                        {formatScore(row.cloud1W)}
                      </td>

                      {/* Cloud 1M */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.cloud1M)}`}>
                        {formatScore(row.cloud1M)}
                      </td>

                      {/* Cloud Sum */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold bg-cyan-950/15 border-r border-slate-800/60">
                        <span className={`px-2 py-0.5 rounded ${getScoreColorClass(row.cloudSum, true)}`}>
                          {formatScore(row.cloudSum)}
                        </span>
                      </td>

                      {/* TKx 1H */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.tkx1H)}`}>
                        {formatScore(row.tkx1H)}
                      </td>

                      {/* TKx 1D */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.tkx1D)}`}>
                        {formatScore(row.tkx1D)}
                      </td>

                      {/* TKx 1W */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.tkx1W)}`}>
                        {formatScore(row.tkx1W)}
                      </td>

                      {/* TKx 1M */}
                      <td className={`py-2.5 px-2.5 text-right font-mono ${getScoreColorClass(row.tkx1M)}`}>
                        {formatScore(row.tkx1M)}
                      </td>

                      {/* TKx Sum */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold bg-indigo-950/15 border-r border-slate-800/60">
                        <span className={`px-2 py-0.5 rounded ${getScoreColorClass(row.tkxSum, true)}`}>
                          {formatScore(row.tkxSum)}
                        </span>
                      </td>

                      {/* Total Score Sum */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold bg-emerald-950/15">
                        <span className={`px-2.5 py-1 rounded-md text-xs ${getScoreColorClass(row.totalScoreSum, true)}`}>
                          {formatScore(row.totalScoreSum)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Watchlist */}
                          <button
                            onClick={() => addTickerToWatchlist(row.symbol)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              inWatchlist
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                            title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                          >
                            {inWatchlist ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>

                          {/* Alert */}
                          <button
                            onClick={() => onOpenAlertModal(row.symbol)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Create Real-Time Alert"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

                          {/* Chart */}
                          <button
                            onClick={() => handleOpenChart(row.symbol)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Open Ichimoku Chart"
                          >
                            <LineChart className="w-3.5 h-3.5" />
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
          totalItems={sortedRows.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[25, 50, 100]}
          itemLabel="constituents"
          sourceLabel="from GitHub CSV"
        />

        {/* Legend bar & Source */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Bullish (+Score)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>Bearish (-Score)</span>
            </span>
          </div>
          <a
            href={getGitHubRepoFileUrl(selectedIndex, 'sum')}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <span>Raw CSV source ({rows.length} total rows)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
