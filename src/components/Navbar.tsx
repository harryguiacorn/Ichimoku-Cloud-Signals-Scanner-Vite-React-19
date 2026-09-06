import React, { useState } from 'react';
import {
  TrendingUp,
  Bell,
  User,
  Sliders,
  LogOut,
  Sparkles,
  ExternalLink,
  Code2,
  ListPlus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'home' | 'scanner' | 'chikou' | 'watchlist' | 'alerts' | 'architecture';
  setCurrentTab: (tab: 'home' | 'scanner' | 'chikou' | 'watchlist' | 'alerts' | 'architecture') => void;
  openAuthModal: () => void;
  openAlertsModal: () => void;
  openApiSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openAlertsModal,
  openApiSettings,
}) => {
  const { user, isAuthenticated, isGuest, logout, unreadCount, notifications, markAllNotificationsRead } = useAuth();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Live Market Ribbon */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-6 overflow-hidden">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">LIVE CLOUD SCANNER ACTIVE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">S&P 500:</span>
            <span className="text-emerald-400 font-medium">5,842.10 (+0.45%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">NASDAQ 100:</span>
            <span className="text-emerald-400 font-medium">20,410.80 (+0.82%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">DOW 30:</span>
            <span className="text-emerald-400 font-medium">42,350.20 (+0.21%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">GOLD:</span>
            <span className="text-amber-400 font-medium">$2,748.50 (+0.85%)</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/harryguiacorn/Ichimoku-Cloud-Signal-Python"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 hover:text-cyan-400 transition-colors"
            title="View Python Source Code on GitHub"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>harryguiacorn/Ichimoku-Cloud-Signal-Python</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-700">|</span>
          <button
            onClick={openApiSettings}
            className="flex items-center space-x-1 hover:text-slate-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Backend Sync</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-white">Ichimoku Cloud</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Signals
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Multi-Timeframe Kumo & Kicker Scanner</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'home'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home & Overview
          </button>
          <button
            onClick={() => setCurrentTab('scanner')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'scanner'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            ☁️ Cloud & TKx Scan
          </button>
          <button
            onClick={() => setCurrentTab('chikou')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'chikou'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🏹 Chikou Scan
          </button>
          <button
            onClick={() => setCurrentTab('watchlist')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              currentTab === 'watchlist'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            My Dashboard
            {isAuthenticated && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-cyan-300 font-mono">
                Live
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('alerts')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              currentTab === 'alerts'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Real-Time Alerts
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-mono animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('architecture')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'architecture'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Options & Pros/Cons</span>
            </span>
          </button>
        </nav>

        {/* Right Action Icons & User State */}
        <div className="flex items-center space-x-3">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Recent Ichimoku Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-950 animate-ping"></span>
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-950"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-sm text-white">Live Signal Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-slate-400 hover:text-cyan-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No active alerts yet. Configure your rules in Alerts.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        className={`py-2.5 px-2 rounded-lg transition-colors ${
                          n.read ? 'opacity-70' : 'bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-cyan-400 font-mono">{n.ticker}</span>
                          <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      openAlertsModal();
                    }}
                    className="text-cyan-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Configure Alert Rules</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      setCurrentTab('alerts');
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    View History
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                {isGuest && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono">
                    DEMO
                  </span>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user.tradingExperience} Trader</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('watchlist');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                    >
                      <ListPlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Watchlists</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openApiSettings();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Backend Python Settings</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={openAuthModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                onClick={openAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-950" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 bg-slate-950 px-2 text-xs">
        <button
          onClick={() => setCurrentTab('home')}
          className={`py-1 px-2 rounded-md ${currentTab === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab('scanner')}
          className={`py-1 px-2 rounded-md ${currentTab === 'scanner' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Cloud
        </button>
        <button
          onClick={() => setCurrentTab('chikou')}
          className={`py-1 px-2 rounded-md ${currentTab === 'chikou' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Chikou
        </button>
        <button
          onClick={() => setCurrentTab('watchlist')}
          className={`py-1 px-2 rounded-md ${currentTab === 'watchlist' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Watchlist
        </button>
        <button
          onClick={() => setCurrentTab('alerts')}
          className={`py-1 px-2 rounded-md ${currentTab === 'alerts' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Alerts
        </button>
        <button
          onClick={() => setCurrentTab('architecture')}
          className={`py-1 px-2 rounded-md ${currentTab === 'architecture' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Options
        </button>
      </div>
    </header>
  );
};
