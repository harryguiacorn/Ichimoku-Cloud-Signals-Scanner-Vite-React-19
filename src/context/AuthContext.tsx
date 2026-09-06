import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserWatchlist, AlertTrigger, AlertNotification, MarketIndex, SignalType } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  watchlists: UserWatchlist[];
  activeWatchlistId: string;
  setActiveWatchlistId: (id: string) => void;
  alerts: AlertTrigger[];
  notifications: AlertNotification[];
  unreadCount: number;
  liveSimulationActive: boolean;
  setLiveSimulationActive: (active: boolean) => void;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string, experience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO', indices: MarketIndex[]) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  createWatchlist: (name: string, description?: string) => string;
  deleteWatchlist: (id: string) => void;
  addTickerToWatchlist: (watchlistId: string, ticker: string) => void;
  removeTickerFromWatchlist: (watchlistId: string, ticker: string) => void;
  isTickerInWatchlist: (watchlistId: string, ticker: string) => boolean;
  createAlert: (ticker: string, condition: AlertTrigger['condition'], targetValue?: number) => void;
  toggleAlert: (alertId: string) => void;
  deleteAlert: (alertId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  triggerMockAlert: (ticker: string, title: string, message: string, type: SignalType, price: number) => void;
}

const DEFAULT_WATCHLISTS: UserWatchlist[] = [
  {
    id: 'wl-primary',
    name: 'Core Momentum Radar',
    description: 'High-conviction stocks trading with strong Ichimoku cloud support',
    isDefault: true,
    createdAt: new Date().toISOString(),
    tickers: ['NVDA', 'AAPL', 'MSFT', 'PLTR', 'GC=F']
  },
  {
    id: 'wl-reversals',
    name: 'Kicker & Reversal Watch',
    description: 'Scanning for daily candlestick kicker confirmations and cloud breakouts',
    createdAt: new Date().toISOString(),
    tickers: ['AMZN', 'TSLA', 'BA', 'AMD']
  }
];

const INITIAL_ALERTS: AlertTrigger[] = [
  {
    id: 'alt-1',
    ticker: 'NVDA',
    condition: 'TK_BULLISH_CROSS',
    active: true,
    notifyEmail: true,
    notifyInApp: true,
    soundEnabled: true,
    createdAt: new Date().toISOString(),
    lastTriggered: '10 mins ago'
  },
  {
    id: 'alt-2',
    ticker: 'PLTR',
    condition: 'KUMO_BREAKOUT_ABOVE',
    active: true,
    notifyEmail: false,
    notifyInApp: true,
    soundEnabled: true,
    createdAt: new Date().toISOString(),
    lastTriggered: '1 hour ago'
  },
  {
    id: 'alt-3',
    ticker: 'TSLA',
    condition: 'KUMO_BREAKDOWN_BELOW',
    active: true,
    notifyEmail: true,
    notifyInApp: true,
    soundEnabled: false,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_NOTIFICATIONS: AlertNotification[] = [
  {
    id: 'notif-1',
    alertId: 'alt-1',
    ticker: 'NVDA',
    title: 'Bullish TK Cross Confirmed',
    message: 'Tenkan-sen ($135.20) crossed above Kijun-sen ($131.50) while trading above the daily Green Kumo Cloud.',
    signalType: 'STRONG_BULLISH',
    timestamp: '10m ago',
    read: false,
    priceAtTrigger: 138.45
  },
  {
    id: 'notif-2',
    alertId: 'alt-2',
    ticker: 'PLTR',
    title: 'Daily Kumo Cloud Breakout',
    message: 'Price closed decisively above Senkou Span A ($47.80). Daily strength score upgraded to +5.',
    signalType: 'STRONG_BULLISH',
    timestamp: '1h ago',
    read: false,
    priceAtTrigger: 58.60
  },
  {
    id: 'notif-3',
    alertId: 'alt-3',
    ticker: 'BA',
    title: 'Bearish Kicker Pattern Detected',
    message: 'Price gapped down below Kijun support ($162.40) on heavy volume.',
    signalType: 'STRONG_BEARISH',
    timestamp: '3h ago',
    read: true,
    priceAtTrigger: 154.30
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ichimoku_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [watchlists, setWatchlists] = useState<UserWatchlist[]>(() => {
    try {
      const saved = localStorage.getItem('ichimoku_watchlists');
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLISTS;
    } catch {
      return DEFAULT_WATCHLISTS;
    }
  });

  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(() => {
    return watchlists[0]?.id || 'wl-primary';
  });

  const [alerts, setAlerts] = useState<AlertTrigger[]>(() => {
    try {
      const saved = localStorage.getItem('ichimoku_alerts');
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [notifications, setNotifications] = useState<AlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem('ichimoku_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(true);

  // Save changes to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ichimoku_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ichimoku_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ichimoku_watchlists', JSON.stringify(watchlists));
  }, [watchlists]);

  useEffect(() => {
    localStorage.setItem('ichimoku_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('ichimoku_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Periodic real-time alert simulator to demonstrate live market signals
  useEffect(() => {
    if (!liveSimulationActive) return;

    const possibleAlerts = [
      {
        ticker: 'AMZN',
        title: 'Bullish Kicker Signal',
        message: 'High-volume open above previous day high with Tenkan support holding at $209.10.',
        type: 'STRONG_BULLISH' as SignalType,
        price: 212.40
      },
      {
        ticker: 'GC=F',
        title: 'Gold All-Time High Extension',
        message: 'Chikou span maintains clean elevation above 26-period past candles. Cloud thickness +60.0.',
        type: 'STRONG_BULLISH' as SignalType,
        price: 2748.50
      },
      {
        ticker: 'CAT',
        title: 'Tenkan-sen Bounce Observed',
        message: 'Price tested $392.00 Tenkan support and rebounded with rising volume.',
        type: 'BULLISH' as SignalType,
        price: 395.70
      }
    ];

    const interval = setInterval(() => {
      // Pick a random alert periodically (every 45 seconds)
      const randomAlert = possibleAlerts[Math.floor(Math.random() * possibleAlerts.length)];
      triggerMockAlert(
        randomAlert.ticker,
        randomAlert.title,
        randomAlert.message,
        randomAlert.type,
        randomAlert.price
      );
    }, 45000);

    return () => clearInterval(interval);
  }, [liveSimulationActive]);

  const triggerMockAlert = (
    ticker: string,
    title: string,
    message: string,
    signalType: SignalType,
    price: number
  ) => {
    const newNotif: AlertNotification = {
      id: `notif-${Date.now()}`,
      ticker,
      title,
      message,
      signalType,
      timestamp: 'Just now',
      read: false,
      priceAtTrigger: price
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Optional audio ping if user preferences allow
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  const login = (email: string): boolean => {
    const userProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase() || 'Trader',
      tradingExperience: 'INTERMEDIATE',
      favoriteIndices: ['SP500', 'NASDAQ100', 'FUTURES'],
      emailAlertsEnabled: true,
      soundAlertsEnabled: true,
      createdAt: new Date().toISOString()
    };
    setUser(userProfile);
    return true;
  };

  const register = (
    name: string,
    email: string,
    _pass: string,
    experience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO',
    indices: MarketIndex[]
  ): boolean => {
    const userProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      tradingExperience: experience,
      favoriteIndices: indices.length > 0 ? indices : ['SP500', 'NASDAQ100'],
      emailAlertsEnabled: true,
      soundAlertsEnabled: true,
      createdAt: new Date().toISOString()
    };
    setUser(userProfile);
    return true;
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest-demo-user',
      email: 'demo-trader@ichimoku-cloud.io',
      name: 'Alpha Trader (Demo)',
      tradingExperience: 'ADVANCED',
      favoriteIndices: ['SP500', 'NASDAQ100', 'DOW30', 'FUTURES'],
      emailAlertsEnabled: true,
      soundAlertsEnabled: true,
      createdAt: new Date().toISOString()
    };
    setUser(guestUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updated });
  };

  const createWatchlist = (name: string, description?: string): string => {
    const newId = `wl-${Date.now()}`;
    const newWatchlist: UserWatchlist = {
      id: newId,
      name: name.trim() || 'My New Watchlist',
      description,
      createdAt: new Date().toISOString(),
      tickers: []
    };
    setWatchlists(prev => [...prev, newWatchlist]);
    setActiveWatchlistId(newId);
    return newId;
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists(prev => {
      const filtered = prev.filter(w => w.id !== id);
      if (activeWatchlistId === id && filtered.length > 0) {
        setActiveWatchlistId(filtered[0].id);
      }
      return filtered;
    });
  };

  const addTickerToWatchlist = (watchlistId: string, ticker: string) => {
    setWatchlists(prev =>
      prev.map(w => {
        if (w.id === watchlistId) {
          if (w.tickers.includes(ticker)) return w;
          return { ...w, tickers: [...w.tickers, ticker] };
        }
        return w;
      })
    );
  };

  const removeTickerFromWatchlist = (watchlistId: string, ticker: string) => {
    setWatchlists(prev =>
      prev.map(w => {
        if (w.id === watchlistId) {
          return { ...w, tickers: w.tickers.filter(t => t !== ticker) };
        }
        return w;
      })
    );
  };

  const isTickerInWatchlist = (watchlistId: string, ticker: string): boolean => {
    const wl = watchlists.find(w => w.id === watchlistId);
    return wl ? wl.tickers.includes(ticker) : false;
  };

  const createAlert = (ticker: string, condition: AlertTrigger['condition'], targetValue?: number) => {
    const newAlert: AlertTrigger = {
      id: `alt-${Date.now()}`,
      ticker,
      condition,
      targetValue,
      active: true,
      notifyEmail: user?.emailAlertsEnabled ?? true,
      notifyInApp: true,
      soundEnabled: user?.soundAlertsEnabled ?? true,
      createdAt: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, active: !a.active } : a))
    );
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest: user?.id === 'guest-demo-user',
        watchlists,
        activeWatchlistId,
        setActiveWatchlistId,
        alerts,
        notifications,
        unreadCount,
        liveSimulationActive,
        setLiveSimulationActive,
        login,
        register,
        loginAsGuest,
        logout,
        updateProfile,
        createWatchlist,
        deleteWatchlist,
        addTickerToWatchlist,
        removeTickerFromWatchlist,
        isTickerInWatchlist,
        createAlert,
        toggleAlert,
        deleteAlert,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        triggerMockAlert
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
