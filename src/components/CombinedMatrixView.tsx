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
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { StockConstituent } from '../types';
import { useAuth } from '../context/AuthContext';
import { Pagination } from './Pagination';

interface CombinedMatrixViewProps {
  stocks: StockConstituent[];
  onSelectStock: (stock: StockConstituent) => void;
  onOpenAlertModal: (ticker: string) => void;
}

type SortKey = 'ticker' | 'name' | 'price' | 'cloudSum' | 'tkxSum' | 'chikouSum' | 'totalScoreSum';

export const CombinedMatrixView: React.FC<CombinedMatrixViewProps> = ({
  stocks,
  onSelectStock,
  onOpenAlertModal
}) => {
  const { isTickerInWatchlist, addTickerToWatchlist } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ALIGNED_BULLISH' | 'ALIGNED_BEARISH' | 'HIGH_SCORE'>('ALL');
  const [sortField, setSortField] = useState<SortKey>('totalScoreSum');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination state: default 25 rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // Filter
  const filteredStocks = useMemo(() => {
    return stocks.filter(s => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.ticker.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) {
          return false;
        }
      }

      const total = s.totalScoreSum ?? 0;
      const cSum = s.cloudSum ?? 0;
      const tSum = s.tkxSum ?? 0;
      const chkSum = s.chikouSum ?? 0;

      if (filterType === 'ALIGNED_BULLISH') {
        // Cloud > 0, TKx > 0, Chikou > 0
        return cSum > 0 && tSum > 0 && chkSum > 0;
      }
      if (filterType === 'ALIGNED_BEARISH') {
        return cSum < 0 && tSum < 0 && chkSum < 0;
      }
      if (filterType === 'HIGH_SCORE') {
        return total >= 300;
      }

      return true;
    });
  }, [stocks, searchQuery, filterType]);

  // Sort
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let valA: any = a[sortField] ?? 0;
      let valB: any = b[sortField] ?? 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortAsc ? numA - numB : numB - numA;
    });
  }, [filteredStocks, sortField, sortAsc]);

  // Paginated stocks for current page
  const paginatedStocks = useMemo(() => {
    if (sortedStocks.length <= 25 && pageSize === 25) return sortedStocks;
    const start = (currentPage - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [sortedStocks, currentPage, pageSize]);

  const handleSort = (field: SortKey) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderSortIndicator = (field: SortKey) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  const getVerdict = (stock: StockConstituent) => {
    const cSum = stock.cloudSum ?? 0;
    const tSum = stock.tkxSum ?? 0;
    const chkSum = stock.chikouSum ?? 0;
    const total = stock.totalScoreSum ?? 0;

    if (cSum > 50 && tSum > 20 && chkSum > 0) {
      return {
        label: 'TRIPLE BULLISH ALIGNMENT',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: '🚀'
      };
    }
    if (cSum < -50 && tSum < -20 && chkSum < 0) {
      return {
        label: 'TRIPLE BEARISH PRESSURE',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: '⚠️'
      };
    }
    if (total > 250) {
      return {
        label: 'BULLISH MOMENTUM',
        color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        icon: '▲'
      };
    }
    if (total < -250) {
      return {
        label: 'BEARISH MOMENTUM',
        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: '▼'
      };
    }
    return {
      label: 'CONSOLIDATION / NEUTRAL',
      color: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: '•'
    };
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search unified matrix..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterType === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Matrix ({stocks.length})
          </button>
          <button
            onClick={() => setFilterType('ALIGNED_BULLISH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterType === 'ALIGNED_BULLISH'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
            }`}
          >
            🚀 Triple Bullish (Cloud+TKx+Chikou)
          </button>
          <button
            onClick={() => setFilterType('ALIGNED_BEARISH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterType === 'ALIGNED_BEARISH'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
            }`}
          >
            ⚠️ Triple Bearish
          </button>
          <button
            onClick={() => setFilterType('HIGH_SCORE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterType === 'HIGH_SCORE'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🔥 Top Scores (300+)
          </button>
        </div>
      </div>

      {/* Main Combined Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold select-none">
                <th
                  onClick={() => handleSort('ticker')}
                  className="py-3 px-4 cursor-pointer hover:text-white group"
                >
                  <div className="flex items-center space-x-1">
                    <span>Ticker</span>
                    {renderSortIndicator('ticker')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-white group"
                >
                  <div className="flex items-center space-x-1">
                    <span>Company Name</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white group"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Price</span>
                    {renderSortIndicator('price')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('cloudSum')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 group"
                  title="Sum of 1H, 1D, 1W, 1M Ichimoku Cloud scores"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Cloud Sum</span>
                    {renderSortIndicator('cloudSum')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('tkxSum')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-indigo-300 group"
                  title="Sum of 1H, 1D, 1W, 1M Tenkan/Kijun cross scores"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>TKx Sum</span>
                    {renderSortIndicator('tkxSum')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('chikouSum')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-amber-300 group"
                  title="Sum of Chikou span counts across all timeframes"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Chikou Sum</span>
                    {renderSortIndicator('chikouSum')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('totalScoreSum')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-emerald-300 group font-bold bg-emerald-950/30"
                  title="Total Composite Score Sum"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Score Sum</span>
                    {renderSortIndicator('totalScoreSum')}
                  </div>
                </th>

                <th className="py-3 px-4 text-center">Ichimoku Matrix Verdict</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching stocks found in matrix.
                  </td>
                </tr>
              ) : (
                paginatedStocks.map(stock => {
                  const inWatchlist = isTickerInWatchlist(stock.ticker);
                  const verdict = getVerdict(stock);
                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        <button
                          onClick={() => onSelectStock(stock)}
                          className="hover:text-cyan-400 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{stock.ticker}</span>
                          <LineChart className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      <td className="py-2.5 px-4 text-slate-300 max-w-[200px] truncate" title={stock.name}>
                        {stock.name}
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono text-slate-100 font-medium">
                        ${stock.price.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          (stock.cloudSum ?? 0) > 0 ? 'text-emerald-300 bg-emerald-500/10' : (stock.cloudSum ?? 0) < 0 ? 'text-rose-300 bg-rose-500/10' : 'text-slate-400'
                        }`}>
                          {(stock.cloudSum ?? 0) > 0 ? `+${stock.cloudSum}` : stock.cloudSum ?? 0}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          (stock.tkxSum ?? 0) > 0 ? 'text-indigo-300 bg-indigo-500/10' : (stock.tkxSum ?? 0) < 0 ? 'text-rose-300 bg-rose-500/10' : 'text-slate-400'
                        }`}>
                          {(stock.tkxSum ?? 0) > 0 ? `+${stock.tkxSum}` : stock.tkxSum ?? 0}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          (stock.chikouSum ?? 0) > 0 ? 'text-amber-300 bg-amber-500/10' : (stock.chikouSum ?? 0) < 0 ? 'text-rose-300 bg-rose-500/10' : 'text-slate-400'
                        }`}>
                          {(stock.chikouSum ?? 0) > 0 ? `+${stock.chikouSum}` : stock.chikouSum ?? 0}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono font-bold bg-emerald-950/15">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          (stock.totalScoreSum ?? 0) > 100
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : (stock.totalScoreSum ?? 0) < -100
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {(stock.totalScoreSum ?? 0) > 0 ? `+${stock.totalScoreSum}` : stock.totalScoreSum ?? 0}
                        </span>
                      </td>

                      {/* Verdict */}
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${verdict.color}`}>
                          <span>{verdict.icon}</span>
                          <span>{verdict.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => addTickerToWatchlist(stock.ticker)}
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
                            onClick={() => onOpenAlertModal(stock.ticker)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Create Alert"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectStock(stock)}
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
          totalItems={sortedStocks.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[25, 50, 100]}
          itemLabel="matrix constituents"
          sourceLabel=""
        />
      </div>
    </div>
  );
};
