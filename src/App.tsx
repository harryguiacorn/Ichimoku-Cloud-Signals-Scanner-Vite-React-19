import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroHome } from './components/HeroHome';
import { MarketScannerTable } from './components/MarketScannerTable';
import { UserWatchlistDashboard } from './components/UserWatchlistDashboard';
import { AlertsManager } from './components/AlertsManagerModal';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { IchimokuChartModal } from './components/IchimokuChartModal';
import { AuthModal } from './components/AuthModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GitHubSyncHeader } from './components/GitHubSyncHeader';
import { IchimokuCloudScanView } from './components/IchimokuCloudScanView';
import { ChikouScanView } from './components/ChikouScanView';
import { CombinedMatrixView } from './components/CombinedMatrixView';
import { ALL_STOCKS_WITH_CANDLES } from './data/mockMarketData';
import { StockConstituent, CloudScanRow, ChikouScanRow, GitHubSyncMeta } from './types';
import {
  fetchMergedIndexData,
  downloadCsvFile,
  checkForGitHubUpdate,
  clearMemoryCache,
  SUPPORTED_INDICES
} from './services/githubCsvService';
import { AutoSyncToast } from './components/GitHubSyncHeader';
import { TrendingUp, Code2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'scanner' | 'chikou' | 'watchlist' | 'alerts' | 'architecture'
  >('home');
  const [selectedStockForChart, setSelectedStockForChart] = useState<StockConstituent | null>(null);
  const [selectedTickerForAlert, setSelectedTickerForAlert] = useState<string | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);

  // Live GitHub CSV state
  const [selectedIndex, setSelectedIndex] = useState<string>('SPX500');
  const [activeScanType, setActiveScanType] = useState<'cloud' | 'chikou' | 'matrix'>('cloud');
  const [cloudRows, setCloudRows] = useState<CloudScanRow[]>([]);
  const [chikouRows, setChikouRows] = useState<ChikouScanRow[]>([]);
  const [unifiedStocks, setUnifiedStocks] = useState<StockConstituent[]>(ALL_STOCKS_WITH_CANDLES);
  const [githubMeta, setGithubMeta] = useState<GitHubSyncMeta | null>(null);
  const [isLoadingCsv, setIsLoadingCsv] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Auto-sync state
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncInterval, setSyncInterval] = useState<number>(120); // 120 seconds default (2 min)
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(new Date());
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [newUpdateToast, setNewUpdateToast] = useState<AutoSyncToast | null>(null);

  // Fetch live CSVs for selected index
  const loadIndexData = useCallback(async (indexId: string, forceFresh = false) => {
    setIsLoadingCsv(true);
    setLoadError(null);
    try {
      const data = await fetchMergedIndexData(indexId, forceFresh);
      setCloudRows(data.cloudRows);
      setChikouRows(data.chikouRows);
      if (data.unifiedStocks.length > 0) {
        setUnifiedStocks(data.unifiedStocks);
      }
      setGithubMeta(data.meta);
      setLastCheckedTime(new Date());
    } catch (err: any) {
      console.error('Error fetching live GitHub CSVs:', err);
      setLoadError(err.message || 'Failed to pull live CSV data from GitHub');
    } finally {
      setIsLoadingCsv(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadIndexData(selectedIndex);
  }, [selectedIndex, loadIndexData]);

  // Background update check function
  const performUpdateCheck = useCallback(async () => {
    if (isCheckingUpdate || isLoadingCsv) return;
    setIsCheckingUpdate(true);
    try {
      const result = await checkForGitHubUpdate(githubMeta?.commitSha);
      setLastCheckedTime(new Date());

      if (
        result.hasUpdate &&
        result.meta.commitSha &&
        githubMeta?.commitSha &&
        result.meta.commitSha.toLowerCase() !== githubMeta.commitSha.toLowerCase()
      ) {
        console.log(`[Auto-Sync] New GitHub Action detected: #${result.meta.commitSha}`);
        clearMemoryCache();
        setNewUpdateToast({
          sha: result.meta.commitSha,
          message: result.meta.commitMessage,
          timestamp: new Date().toLocaleTimeString()
        });

        // Automatically reload current index data with forceFresh = true
        await loadIndexData(selectedIndex, true);
      } else {
        setGithubMeta(prev => (prev ? { ...prev, lastChecked: new Date().toISOString() } : result.meta));
      }
    } catch (err) {
      console.warn('[Auto-Sync] Background check error:', err);
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [isCheckingUpdate, isLoadingCsv, githubMeta?.commitSha, selectedIndex, loadIndexData]);

  // Periodic timer for background commit checks
  useEffect(() => {
    if (!autoSyncEnabled || syncInterval <= 0) return;

    const timer = setInterval(() => {
      performUpdateCheck();
    }, syncInterval * 1000);

    return () => clearInterval(timer);
  }, [autoSyncEnabled, syncInterval, performUpdateCheck]);

  // Window visibility & focus listener (checks if user returns to tab after > 30s)
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && autoSyncEnabled) {
        const elapsed = lastCheckedTime ? (Date.now() - lastCheckedTime.getTime()) / 1000 : 999;
        if (elapsed > 30) {
          performUpdateCheck();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [autoSyncEnabled, lastCheckedTime, performUpdateCheck]);

  const handleOpenAlertForTicker = (ticker: string) => {
    setSelectedTickerForAlert(ticker);
    setShowAlertsModal(true);
  };

  const handleRefreshFromGitHub = () => {
    loadIndexData(selectedIndex, true);
  };

  const handleDownloadCsv = (type: 'sum' | 'chikou') => {
    downloadCsvFile(selectedIndex, type);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openAuthModal={() => setShowAuthModal(true)}
          openAlertsModal={() => {
            setSelectedTickerForAlert(undefined);
            setShowAlertsModal(true);
          }}
          openApiSettings={() => setShowApiSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentTab === 'home' && (
            <HeroHome
              stocks={unifiedStocks}
              onExploreScanner={() => {
                setActiveScanType('cloud');
                setCurrentTab('scanner');
              }}
              onOpenDashboard={() => setCurrentTab('watchlist')}
              onOpenArchitecture={() => setCurrentTab('architecture')}
              onSelectStock={stock => setSelectedStockForChart(stock)}
            />
          )}

          {/* Cloud & TKx Scan or Matrix View */}
          {currentTab === 'scanner' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <GitHubSyncHeader
                selectedIndex={selectedIndex}
                onSelectIndex={id => setSelectedIndex(id)}
                indices={SUPPORTED_INDICES}
                meta={githubMeta}
                isLoading={isLoadingCsv}
                onRefresh={handleRefreshFromGitHub}
                onDownloadCsv={handleDownloadCsv}
                activeScanType={activeScanType}
                onChangeScanType={setActiveScanType}
                totalRows={activeScanType === 'chikou' ? chikouRows.length : cloudRows.length}
                autoSyncEnabled={autoSyncEnabled}
                onToggleAutoSync={setAutoSyncEnabled}
                syncInterval={syncInterval}
                onChangeSyncInterval={setSyncInterval}
                lastCheckedTime={lastCheckedTime}
                isCheckingUpdate={isCheckingUpdate}
                onManualCheckUpdate={performUpdateCheck}
                newUpdateToast={newUpdateToast}
                onDismissToast={() => setNewUpdateToast(null)}
              />

              {loadError && (
                <div className="mb-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>{loadError} (reverting to cached or preloaded constituents)</span>
                  </div>
                  <button
                    onClick={handleRefreshFromGitHub}
                    className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold"
                  >
                    Retry Fetch
                  </button>
                </div>
              )}

              {isLoadingCsv && cloudRows.length === 0 ? (
                <div className="py-24 text-center">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                  <p className="text-base font-semibold text-white">
                    Pulling latest CSV data from GitHub Actions...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Fetching raw.githubusercontent.com/harryguiacorn/Ichimoku-Cloud-Signal-Python/master/output/sum/
                  </p>
                </div>
              ) : activeScanType === 'cloud' ? (
                <IchimokuCloudScanView
                  rows={cloudRows}
                  selectedIndex={selectedIndex}
                  onSelectStock={stock => setSelectedStockForChart(stock)}
                  onOpenAlertModal={handleOpenAlertForTicker}
                  unifiedStocks={unifiedStocks}
                />
              ) : activeScanType === 'chikou' ? (
                <ChikouScanView
                  rows={chikouRows}
                  selectedIndex={selectedIndex}
                  onSelectStock={stock => setSelectedStockForChart(stock)}
                  onOpenAlertModal={handleOpenAlertForTicker}
                  unifiedStocks={unifiedStocks}
                />
              ) : (
                <CombinedMatrixView
                  stocks={unifiedStocks}
                  onSelectStock={stock => setSelectedStockForChart(stock)}
                  onOpenAlertModal={handleOpenAlertForTicker}
                />
              )}
            </div>
          )}

          {/* Chikou Span Dedicated Tab */}
          {currentTab === 'chikou' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <GitHubSyncHeader
                selectedIndex={selectedIndex}
                onSelectIndex={id => setSelectedIndex(id)}
                indices={SUPPORTED_INDICES}
                meta={githubMeta}
                isLoading={isLoadingCsv}
                onRefresh={handleRefreshFromGitHub}
                onDownloadCsv={handleDownloadCsv}
                activeScanType="chikou"
                onChangeScanType={type => {
                  setActiveScanType(type);
                  setCurrentTab('scanner');
                }}
                totalRows={chikouRows.length}
                autoSyncEnabled={autoSyncEnabled}
                onToggleAutoSync={setAutoSyncEnabled}
                syncInterval={syncInterval}
                onChangeSyncInterval={setSyncInterval}
                lastCheckedTime={lastCheckedTime}
                isCheckingUpdate={isCheckingUpdate}
                onManualCheckUpdate={performUpdateCheck}
                newUpdateToast={newUpdateToast}
                onDismissToast={() => setNewUpdateToast(null)}
              />

              {isLoadingCsv && chikouRows.length === 0 ? (
                <div className="py-24 text-center">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                  <p className="text-base font-semibold text-white">
                    Pulling Chikou Span CSV data from GitHub Actions...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Fetching output/chikou/{selectedIndex}-chikou-merged.csv
                  </p>
                </div>
              ) : (
                <ChikouScanView
                  rows={chikouRows}
                  selectedIndex={selectedIndex}
                  onSelectStock={stock => setSelectedStockForChart(stock)}
                  onOpenAlertModal={handleOpenAlertForTicker}
                  unifiedStocks={unifiedStocks}
                />
              )}
            </div>
          )}

          {currentTab === 'watchlist' && (
            <UserWatchlistDashboard
              stocks={unifiedStocks}
              onSelectStock={stock => setSelectedStockForChart(stock)}
              onOpenAlertModal={handleOpenAlertForTicker}
              onOpenAuthModal={() => setShowAuthModal(true)}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsManager
              stocks={unifiedStocks}
              onSelectStock={stock => setSelectedStockForChart(stock)}
            />
          )}

          {currentTab === 'architecture' && <ArchitectureExplorer />}
        </main>

        {/* Chart Inspection Modal */}
        {selectedStockForChart && (
          <IchimokuChartModal
            stock={selectedStockForChart}
            onClose={() => setSelectedStockForChart(null)}
            onOpenAlertModal={ticker => {
              setSelectedStockForChart(null);
              handleOpenAlertForTicker(ticker);
            }}
          />
        )}

        {/* Alert Rule Creator Modal (when triggered via header or button) */}
        {showAlertsModal && (
          <AlertsManager
            stocks={unifiedStocks}
            preselectedTicker={selectedTickerForAlert}
            isOpenAsModal={true}
            onClose={() => setShowAlertsModal(false)}
            onSelectStock={stock => {
              setShowAlertsModal(false);
              setSelectedStockForChart(stock);
            }}
          />
        )}

        {/* Authentication Modal */}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

        {/* Backend / API Settings Modal */}
        {showApiSettings && <ApiSettingsModal onClose={() => setShowApiSettings(false)} />}

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-300">Ichimoku Cloud Signals Scanner</p>
                <p className="text-[11px] text-slate-500">
                  Powered by Python Multi-Timeframe Kumo, Chikou Span & Candlestick Kicker algorithms.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a
                href="https://github.com/harryguiacorn/Ichimoku-Cloud-Signal-Python"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="https://ichimoku-cloud-signal-python.pages.dev/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
              >
                <span>Live Pages Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setCurrentTab('architecture')}
                className="hover:text-slate-300 transition-colors"
              >
                Architecture & Trade-Offs
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
            <p>
              Disclaimer: For technical analysis and screening purposes only. Not financial investment advice.
            </p>
            <p>
              Real-time multi-index scanner • S&P 500 • Nasdaq 100 • Dow 30 • Russell 1000 • FTSE 100 • Futures • Crypto
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
