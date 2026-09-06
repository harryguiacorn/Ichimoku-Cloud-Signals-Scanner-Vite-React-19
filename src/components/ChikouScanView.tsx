import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LineChart,
  Plus,
  CheckCircle2,
  Bell,
  ExternalLink,
  Target,
  Compass
} from 'lucide-react';
import { ChikouScanRow, StockConstituent } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTabulatorPageUrl, getGitHubRepoFileUrl } from '../services/githubCsvService';
import { Pagination } from './Pagination';

interface ChikouScanViewProps {
  rows: ChikouScanRow[];
  selectedIndex: string;
  onSelectStock: (stock: StockConstituent) => void;
  onOpenAlertModal: (ticker: string) => void;
  unifiedStocks: StockConstituent[];
}

type SortField =
  | 'symbol'
  | 'name'
  | 'count1H'
  | 'count1D'
  | 'count1W'
  | 'count1M'
  | 'chikouScoreSum';

export const ChikouScanView: React.FC<ChikouScanViewProps> = ({
  rows,
  selectedIndex,
  onSelectStock,
  onOpenAlertModal,
  unifiedStocks
}) => {
  const { isTickerInWatchlist, addTickerToWatchlist } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPreset, setFilterPreset] = useState<
    'ALL' | '1D_ABOVE' | '1D_BELOW' | 'ALL_ABOVE' | 'HIGH_MOMENTUM' | 'NEGATIVE_SUM'
  >('ALL');
  const [sortField, setSortField] = useState<SortField>('chikouScoreSum');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination state: default 25 rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPreset, selectedIndex]);

  // Map of unified stocks for quick lookup
  const stockMap = useMemo(() => {
    const map = new Map<string, StockConstituent>();
    unifiedStocks.forEach(s => map.set(s.ticker.toUpperCase(), s));
    return map;
  }, [unifiedStocks]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSymbol = r.symbol.toLowerCase().includes(q);
        const matchName = r.name.toLowerCase().includes(q);
        if (!matchSymbol && !matchName) return false;
      }

      // Presets
      if (filterPreset === '1D_ABOVE') {
        return r.state1D.toLowerCase().includes('above') || r.count1D > 0;
      }
      if (filterPreset === '1D_BELOW') {
        return r.state1D.toLowerCase().includes('below') || r.count1D < 0;
      }
      if (filterPreset === 'ALL_ABOVE') {
        const h = r.state1H.toLowerCase().includes('above') || r.count1H > 0;
        const d = r.state1D.toLowerCase().includes('above') || r.count1D > 0;
        const w = r.state1W.toLowerCase().includes('above') || r.count1W > 0;
        const m = r.state1M.toLowerCase().includes('above') || r.count1M > 0;
        return h && d && w && m;
      }
      if (filterPreset === 'HIGH_MOMENTUM') {
        return r.count1D >= 30 || r.count1W >= 30;
      }
      if (filterPreset === 'NEGATIVE_SUM') {
        return r.chikouScoreSum < 0;
      }

      return true;
    });
  }, [rows, searchQuery, filterPreset]);

  // Sort rows
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
      setSortAsc(false); // default descending
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

  const renderChikouCell = (state: string, count: number, dir: number) => {
    const isAbove = state.toLowerCase().includes('above') || count > 0 || dir > 0;
    const isBelow = state.toLowerCase().includes('below') || count < 0 || dir < 0;

    if (isAbove) {
      return (
        <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
          <span className="text-[10px]">▲</span>
          <span className="font-semibold">{count > 0 ? `+${count}` : count}</span>
          <span className="text-[10px] text-emerald-400/80 uppercase tracking-tight hidden lg:inline">above</span>
        </div>
      );
    }

    if (isBelow) {
      return (
        <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs">
          <span className="text-[10px]">▼</span>
          <span className="font-semibold">{count}</span>
          <span className="text-[10px] text-rose-400/80 uppercase tracking-tight hidden lg:inline">below</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs">
        <span>0</span>
        <span className="text-[10px] uppercase">flat</span>
      </div>
    );
  };

  const handleOpenChart = (symbol: string) => {
    const stock = stockMap.get(symbol.toUpperCase());
    if (stock) {
      onSelectStock(stock);
    }
  };

  // Preset counts
  const aboveDailyCount = rows.filter(r => r.state1D.toLowerCase().includes('above') || r.count1D > 0).length;
  const belowDailyCount = rows.filter(r => r.state1D.toLowerCase().includes('below') || r.count1D < 0).length;
  const allAboveCount = rows.filter(r => {
    const h = r.state1H.toLowerCase().includes('above') || r.count1H > 0;
    const d = r.state1D.toLowerCase().includes('above') || r.count1D > 0;
    const w = r.state1W.toLowerCase().includes('above') || r.count1W > 0;
    const m = r.state1M.toLowerCase().includes('above') || r.count1M > 0;
    return h && d && w && m;
  }).length;

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
            placeholder="Search Chikou constituents..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterPreset('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterPreset === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => setFilterPreset('ALL_ABOVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterPreset === 'ALL_ABOVE'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/40'
            }`}
          >
            ✨ All 4 Timeframes Above ({allAboveCount})
          </button>
          <button
            onClick={() => setFilterPreset('1D_ABOVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterPreset === '1D_ABOVE'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ▲ 1D Above Chikou ({aboveDailyCount})
          </button>
          <button
            onClick={() => setFilterPreset('1D_BELOW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterPreset === '1D_BELOW'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40'
            }`}
          >
            ▼ 1D Below Chikou ({belowDailyCount})
          </button>
        </div>

        {/* Tabulator View Link */}
        <div className="flex items-center space-x-2">
          <a
            href={getTabulatorPageUrl(selectedIndex, 'chikou')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-medium transition-colors"
            title="Open original Tabulator Chikou HTML view generated by GitHub Actions"
          >
            <span>Tabulator Chikou</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th colSpan={2} className="py-2.5 px-4 text-left font-mono font-medium tracking-wider text-slate-400 border-r border-slate-800/60">
                  CONSTITUENT
                </th>
                <th colSpan={4} className="py-2.5 px-4 text-center font-mono font-medium tracking-wider text-cyan-400 bg-cyan-950/20 border-r border-slate-800/60">
                  CHIKOU SPAN MULTI-TIMEFRAME DIRECTION & BAR COUNTS
                </th>
                <th colSpan={2} className="py-2.5 px-4 text-center font-mono font-medium tracking-wider text-emerald-400 bg-emerald-950/20">
                  CHIKOU SCORE SUM & TOOLS
                </th>
              </tr>

              <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold select-none">
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol</span>
                    {renderSortIndicator('symbol')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors group border-r border-slate-800/60"
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>

                {/* 1H */}
                <th
                  onClick={() => handleSort('count1H')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="1-Hour Chikou state and consecutive bar count"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>1H Chikou</span>
                    {renderSortIndicator('count1H')}
                  </div>
                </th>

                {/* 1D */}
                <th
                  onClick={() => handleSort('count1D')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="Daily Chikou state and consecutive bar count"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>1D Chikou</span>
                    {renderSortIndicator('count1D')}
                  </div>
                </th>

                {/* 1W */}
                <th
                  onClick={() => handleSort('count1W')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-cyan-300 transition-colors group"
                  title="Weekly Chikou state and consecutive bar count"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>1W Chikou</span>
                    {renderSortIndicator('count1W')}
                  </div>
                </th>

                {/* 1M */}
                <th
                  onClick={() => handleSort('count1M')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-cyan-300 transition-colors group border-r border-slate-800/60"
                  title="Monthly Chikou state and consecutive bar count"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>1M Chikou</span>
                    {renderSortIndicator('count1M')}
                  </div>
                </th>

                {/* Chikou Score Sum */}
                <th
                  onClick={() => handleSort('chikouScoreSum')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-emerald-300 transition-colors group font-bold bg-emerald-950/30"
                  title="Sum of Chikou counts across all timeframes"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Chikou Score Sum</span>
                    {renderSortIndicator('chikouScoreSum')}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-base font-medium">No Chikou records match this filter.</p>
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
                        <button
                          onClick={() => handleOpenChart(row.symbol)}
                          className="hover:text-cyan-400 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{row.symbol}</span>
                          <LineChart className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4 text-slate-300 max-w-[220px] truncate border-r border-slate-800/60" title={row.name}>
                        {row.name}
                      </td>

                      {/* 1H */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {renderChikouCell(row.state1H, row.count1H, row.dir1H)}
                      </td>

                      {/* 1D */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {renderChikouCell(row.state1D, row.count1D, row.dir1D)}
                      </td>

                      {/* 1W */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {renderChikouCell(row.state1W, row.count1W, row.dir1W)}
                      </td>

                      {/* 1M */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-800/60">
                        {renderChikouCell(row.state1M, row.count1M, row.dir1M)}
                      </td>

                      {/* Chikou Score Sum */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold bg-emerald-950/15">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs ${
                            row.chikouScoreSum > 50
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : row.chikouScoreSum > 0
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : row.chikouScoreSum < -50
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                              : row.chikouScoreSum < 0
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {row.chikouScoreSum > 0 ? `+${row.chikouScoreSum}` : row.chikouScoreSum}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
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

                          <button
                            onClick={() => onOpenAlertModal(row.symbol)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Create Real-Time Alert"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>

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
          itemLabel="Chikou constituents"
          sourceLabel="from GitHub"
        />

        {/* Legend bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span>▲ Above Chikou (Bullish momentum)</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <span>▼ Below Chikou (Bearish resistance)</span>
            </span>
          </div>
          <a
            href={getGitHubRepoFileUrl(selectedIndex, 'chikou')}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <span>Chikou CSV ({rows.length} total rows)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
