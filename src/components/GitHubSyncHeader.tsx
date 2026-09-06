import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  ExternalLink,
  Github,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Database,
  Calendar,
  Sparkles,
  X,
  Radio,
  Clock,
  HelpCircle,
  Zap
} from 'lucide-react';
import { GitHubSyncMeta } from '../types';
import { IndexInfo } from '../services/githubCsvService';

export interface AutoSyncToast {
  sha: string;
  message: string;
  timestamp: string;
}

interface GitHubSyncHeaderProps {
  selectedIndex: string;
  onSelectIndex: (indexId: string) => void;
  indices: IndexInfo[];
  meta: GitHubSyncMeta | null;
  isLoading: boolean;
  onRefresh: () => void;
  onDownloadCsv: (type: 'sum' | 'chikou') => void;
  activeScanType: 'cloud' | 'chikou' | 'matrix';
  onChangeScanType: (type: 'cloud' | 'chikou' | 'matrix') => void;
  totalRows: number;
  // Auto-sync controls
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  syncInterval: number; // in seconds
  onChangeSyncInterval: (seconds: number) => void;
  lastCheckedTime: Date | null;
  isCheckingUpdate: boolean;
  onManualCheckUpdate: () => void;
  newUpdateToast: AutoSyncToast | null;
  onDismissToast: () => void;
}

export const GitHubSyncHeader: React.FC<GitHubSyncHeaderProps> = ({
  selectedIndex,
  onSelectIndex,
  indices,
  meta,
  isLoading,
  onRefresh,
  onDownloadCsv,
  activeScanType,
  onChangeScanType,
  totalRows,
  autoSyncEnabled,
  onToggleAutoSync,
  syncInterval,
  onChangeSyncInterval,
  lastCheckedTime,
  isCheckingUpdate,
  onManualCheckUpdate,
  newUpdateToast,
  onDismissToast
}) => {
  const currentIndex = indices.find(i => i.id === selectedIndex) || indices[0];
  const [showSyncInfoModal, setShowSyncInfoModal] = useState(false);
  const [secondsSinceCheck, setSecondsSinceCheck] = useState<number>(0);

  // Update "Checked X seconds ago" counter every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastCheckedTime) {
        const secs = Math.floor((Date.now() - lastCheckedTime.getTime()) / 1000);
        setSecondsSinceCheck(secs >= 0 ? secs : 0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastCheckedTime]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Real-time sync';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return isoString;
    }
  };

  const formatSecondsAgo = (secs: number) => {
    if (secs < 10) return 'just now';
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    return `${mins}m ${secs % 60}s ago`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm mb-6">
      {/* Dynamic Toast: When a new GitHub Action commit is detected and auto-synced */}
      {newUpdateToast && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-cyan-950/80 to-slate-900 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0 animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex flex-wrap items-center gap-2">
                <span>GitHub Action Run Detected & Updated!</span>
                <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-700">
                  #{newUpdateToast.sha}
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 font-normal">
                  ⚡ Auto-Reloaded
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                "{newUpdateToast.message}" • Synchronized at {newUpdateToast.timestamp}
              </div>
            </div>
          </div>
          <button
            onClick={onDismissToast}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-3 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top row: Status Banner, Auto-Sync Controls & Action Buttons */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="relative mt-1 sm:mt-0">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-wide">
                Live GitHub Actions Data Stream
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected: master branch
              </span>
              {meta?.commitSha && (
                <a
                  href={meta.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700 inline-flex items-center gap-1 transition-colors"
                  title="View commit in GitHub"
                >
                  <Github className="w-3 h-3" />
                  <span>#{meta.commitSha}</span>
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Last updated: <strong className="text-slate-200">{formatDate(meta?.lastUpdated)}</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400">
                Action: <span className="text-slate-300 italic">{meta?.commitMessage || 'Daily updates Github Action'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Auto-Sync Status and Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Auto-Sync Widget */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                {autoSyncEnabled ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </>
                ) : (
                  <span className="inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                )}
              </span>
              <span className="font-semibold text-slate-300">Auto-Sync:</span>
              <span className="text-slate-400 hidden sm:inline">
                {isCheckingUpdate ? (
                  <span className="text-cyan-400 flex items-center gap-1 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : autoSyncEnabled ? (
                  <span className="text-emerald-400 font-mono">
                    {formatSecondsAgo(secondsSinceCheck)}
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono">Off</span>
                )}
              </span>
            </div>

            {/* Interval Selector */}
            <div className="flex items-center space-x-1 border-l border-slate-800 pl-1.5 pr-1">
              {[
                { label: '1m', val: 60 },
                { label: '2m', val: 120 },
                { label: '5m', val: 300 }
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => {
                    onChangeSyncInterval(item.val);
                    if (!autoSyncEnabled) onToggleAutoSync(true);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    autoSyncEnabled && syncInterval === item.val
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Check for new GitHub Action runs every ${item.label}`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => onToggleAutoSync(!autoSyncEnabled)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  !autoSyncEnabled
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={autoSyncEnabled ? 'Pause automatic checking' : 'Enable automatic checking'}
              >
                {autoSyncEnabled ? 'Pause' : 'Off'}
              </button>
            </div>

            {/* Info modal trigger */}
            <button
              onClick={() => setShowSyncInfoModal(true)}
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors ml-0.5"
              title="How does GitHub Auto-Sync work?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Manual Refresh / Pull CSVs Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading || isCheckingUpdate}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Force immediate cache-busting pull from GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading || isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Pulling CSVs...' : isCheckingUpdate ? 'Checking...' : 'Refresh Now'}</span>
          </button>

          {/* Download CSV Dropdown */}
          <div className="relative inline-flex rounded-xl bg-slate-800 border border-slate-700 p-0.5">
            <button
              onClick={() => onDownloadCsv(activeScanType === 'chikou' ? 'chikou' : 'sum')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Download the current index CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => onDownloadCsv('sum')}
              className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 rounded-lg transition-colors"
              title="Download Ichimoku Cloud & TKx CSV"
            >
              Cloud
            </button>
            <button
              onClick={() => onDownloadCsv('chikou')}
              className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 rounded-lg transition-colors"
              title="Download Chikou Span CSV"
            >
              Chikou
            </button>
          </div>

          <a
            href="https://github.com/harryguiacorn/Ichimoku-Cloud-Signal-Python/tree/master/output"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
            title="Browse all output CSVs in repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Repo CSVs</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Middle row: Index Selector Tabs */}
      <div className="pt-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Market Index / Instrument ({indices.length} Available):</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Loaded: <strong className="text-cyan-400">{totalRows}</strong> constituents
          </span>
        </div>

        {/* Indices Scrollable Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {indices.map(index => {
            const isSelected = index.id === selectedIndex;
            return (
              <button
                key={index.id}
                onClick={() => onSelectIndex(index.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{index.icon}</span>
                <span>{index.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom row: Scan Mode Tabs & Index Info */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-400">View Mode:</span>
          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeScanType('cloud')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeScanType === 'cloud'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ☁️ Ichimoku Cloud & TKx Scan
            </button>
            <button
              onClick={() => onChangeScanType('chikou')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeScanType === 'chikou'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🏹 Chikou Span Scan
            </button>
            <button
              onClick={() => onChangeScanType('matrix')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeScanType === 'matrix'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ⚡ Full Combined Matrix
            </button>
          </div>
        </div>

        {/* Index Description */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="font-semibold text-slate-200">{currentIndex.name}:</span>
          <span className="truncate max-w-xs sm:max-w-md">{currentIndex.description}</span>
        </div>
      </div>

      {/* Explanatory Modal: How GitHub Auto-Sync Works */}
      {showSyncInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">How GitHub Auto-Sync Works</h3>
              </div>
              <button
                onClick={() => setShowSyncInfoModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold font-mono">1</span>
                <div>
                  <h4 className="font-semibold text-white">Periodic Commit SHA Polling</h4>
                  <p className="text-slate-400 mt-0.5">
                    The app checks GitHub's Commit API every <strong>{syncInterval / 60} minutes</strong> (or your chosen interval) for new commits made by your GitHub Action in <code>harryguiacorn/Ichimoku-Cloud-Signal-Python</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold font-mono">2</span>
                <div>
                  <h4 className="font-semibold text-white">ETag & Commit Fingerprinting</h4>
                  <p className="text-slate-400 mt-0.5">
                    It compares the current commit hash (e.g. <code>#{meta?.commitSha || 'latest'}</code>) and output CSV file ETags against the latest published commit.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold font-mono">3</span>
                <div>
                  <h4 className="font-semibold text-white">Automated Zero-Click Reload</h4>
                  <p className="text-slate-400 mt-0.5">
                    As soon as a new GitHub Action run finishes and commits new CSVs, the app automatically flushes cache, pulls the fresh data with cache-busting, and updates all scanner tables without requiring a page reload.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold font-mono">4</span>
                <div>
                  <h4 className="font-semibold text-white">Tab Focus & Window Return</h4>
                  <p className="text-slate-400 mt-0.5">
                    Whenever you switch back to this browser tab after working in another window, the app immediately checks if a new GitHub Action completed while you were away.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSyncInfoModal(false)}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
