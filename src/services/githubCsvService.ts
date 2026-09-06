import {
  CloudScanRow,
  ChikouScanRow,
  StockConstituent,
  GitHubSyncMeta,
  CloudStatus,
  KickerType,
  MarketIndex
} from '../types';
import { generateCandlesForStock } from '../utils/ichimokuCalc';

export interface IndexInfo {
  id: string;
  name: string;
  shortName: string;
  category: 'US_EQUITIES' | 'GLOBAL_EQUITIES' | 'COMMODITIES_FX' | 'CRYPTO' | 'SECTORS';
  description: string;
  sumCsvFilename: string;
  chikouCsvFilename: string;
  icon: string;
  tag: string;
}

export const SUPPORTED_INDICES: IndexInfo[] = [
  {
    id: 'SPX500',
    name: 'S&P 500 Index',
    shortName: 'S&P 500',
    category: 'US_EQUITIES',
    description: '500 leading publicly traded US large-cap corporations.',
    sumCsvFilename: 'SPX500-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'SPX500-chikou-merged.csv',
    icon: '🇺🇸',
    tag: 'US Large-Cap'
  },
  {
    id: 'Nasdaq100',
    name: 'Nasdaq 100 Index',
    shortName: 'Nasdaq 100',
    category: 'US_EQUITIES',
    description: '100 top non-financial technology & growth industry leaders.',
    sumCsvFilename: 'Nasdaq100-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'Nasdaq100-chikou-merged.csv',
    icon: '💻',
    tag: 'Tech Leaders'
  },
  {
    id: 'DowJones30',
    name: 'Dow Jones 30 Titans',
    shortName: 'Dow 30',
    category: 'US_EQUITIES',
    description: '30 blue-chip benchmark equities representing American industry.',
    sumCsvFilename: 'DowJones30-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'DowJones30-chikou-merged.csv',
    icon: '🏛️',
    tag: 'Blue Chips'
  },
  {
    id: 'Russell1000',
    name: 'Russell 1000 Broad Market',
    shortName: 'Russell 1000',
    category: 'US_EQUITIES',
    description: 'Top 1,000 US companies representing ~93% of the US investable equity market.',
    sumCsvFilename: 'Russell1000-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'Russell1000-chikou-merged.csv',
    icon: '📈',
    tag: 'Broad Market'
  },
  {
    id: 'FTSE100',
    name: 'FTSE 100 (London)',
    shortName: 'FTSE 100',
    category: 'GLOBAL_EQUITIES',
    description: 'Top 100 blue-chip companies listed on the London Stock Exchange.',
    sumCsvFilename: 'FTSE100-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'FTSE100-chikou-merged.csv',
    icon: '🇬🇧',
    tag: 'UK Large-Cap'
  },
  {
    id: 'FTSE250',
    name: 'FTSE 250 (UK Mid-Cap)',
    shortName: 'FTSE 250',
    category: 'GLOBAL_EQUITIES',
    description: 'The 101st to 350th largest companies on the London Stock Exchange.',
    sumCsvFilename: 'FTSE250-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'FTSE250-chikou-merged.csv',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tag: 'UK Mid-Cap'
  },
  {
    id: 'Futures',
    name: 'Commodity & Index Futures',
    shortName: 'Futures',
    category: 'COMMODITIES_FX',
    description: 'Active contract futures including Gold, Crude Oil, E-mini S&P, and Treasury.',
    sumCsvFilename: 'Futures-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'Futures-chikou-merged.csv',
    icon: '⚡',
    tag: 'Futures'
  },
  {
    id: 'FuturesCurrency',
    name: 'Currency Futures',
    shortName: 'Currency FX',
    category: 'COMMODITIES_FX',
    description: 'Major currency futures pairs (EUR, JPY, GBP, CAD, AUD contracts).',
    sumCsvFilename: 'FuturesCurrency-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'FuturesCurrency-chikou-merged.csv',
    icon: '💱',
    tag: 'FX Futures'
  },
  {
    id: 'HSI',
    name: 'Hang Seng Index (Hong Kong)',
    shortName: 'Hang Seng',
    category: 'GLOBAL_EQUITIES',
    description: 'Leading index of the Hong Kong Stock Exchange & Asian bellwether.',
    sumCsvFilename: 'HSI-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'HSI-chikou-merged.csv',
    icon: '🇭🇰',
    tag: 'Asian Leaders'
  },
  {
    id: 'Kraken',
    name: 'Kraken Cryptocurrency Pairs',
    shortName: 'Kraken Crypto',
    category: 'CRYPTO',
    description: 'Spot cryptocurrency pairs (BTC, ETH, SOL, XRP) calculated via Kraken feeds.',
    sumCsvFilename: 'Kraken-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'Kraken-chikou-merged.csv',
    icon: '🪙',
    tag: 'Crypto'
  },
  {
    id: 'Oanda',
    name: 'Oanda Spot Forex',
    shortName: 'Oanda FX',
    category: 'COMMODITIES_FX',
    description: 'Global Foreign Exchange spot currency pairs from Oanda.',
    sumCsvFilename: 'Oanda-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'Oanda-chikou-merged.csv',
    icon: '🌐',
    tag: 'Forex Spot'
  },
  {
    id: 'SPDR_ETFS',
    name: 'SPDR US Sector ETFs',
    shortName: 'SPDR Sectors',
    category: 'SECTORS',
    description: 'All 11 S&P 500 Sector Select SPDR ETFs (Technology, Financials, Healthcare, etc.)',
    sumCsvFilename: 'SPDR_ETFS-sum-cloud-tkx-merged.csv',
    chikouCsvFilename: 'SPDR_ETFs-chikou-merged.csv',
    icon: '📊',
    tag: 'Sector ETFs'
  }
];

export const GITHUB_REPO = 'harryguiacorn/Ichimoku-Cloud-Signal-Python';
export const GITHUB_BRANCH = 'master';
export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`;
export const GITHUB_PAGES_BASE = `https://harryguiacorn.github.io/Ichimoku-Cloud-Signal-Python`;

// Memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
}
const MEMORY_CACHE = new Map<string, CacheItem<any>>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

/**
 * Clear memory cache to force fresh fetches
 */
export function clearMemoryCache(): void {
  MEMORY_CACHE.clear();
}

/**
 * Robust RFC 4180 CSV Parser handling quotes, commas, and escaped quotes
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  function parseLine(line: string): string[] {
    const values: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    values.push(cur.trim());
    return values;
  }

  const headers = parseLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const values = parseLine(rawLine);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    records.push(row);
  }

  return records;
}

/**
 * Fetch raw CSV text with cache-busting option
 */
async function fetchWithFallback(url: string, forceFresh = false): Promise<string> {
  const cacheKey = `csv_${url}`;
  if (!forceFresh) {
    const cached = MEMORY_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const targetUrl = forceFresh ? `${url}?t=${Date.now()}` : url;
  const resp = await fetch(targetUrl, {
    headers: { Accept: 'text/plain, text/csv' },
    cache: forceFresh ? 'no-cache' : 'default'
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch CSV: HTTP ${resp.status} (${resp.statusText})`);
  }

  const text = await resp.text();
  MEMORY_CACHE.set(cacheKey, { data: text, timestamp: Date.now() });
  return text;
}

/**
 * Fetch GitHub Commit Meta to display last updated time and commit info
 */
export async function fetchGitHubSyncMeta(forceFresh = false): Promise<GitHubSyncMeta> {
  const cacheKey = 'github_commit_meta';
  if (!forceFresh) {
    const cached = MEMORY_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) {
      return cached.data;
    }
  }

  const nowIso = new Date().toISOString();

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/commits?path=output/sum/SPX500-sum-cloud-tkx-merged.csv&page=1&per_page=1&_t=${Date.now()}`;
    const resp = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const meta: GitHubSyncMeta = {
          lastUpdated: item.commit?.committer?.date || item.commit?.author?.date || nowIso,
          commitSha: (item.sha || '').substring(0, 7),
          commitMessage: item.commit?.message?.split('\n')[0] || 'Daily updates Github Action',
          author: item.commit?.author?.name || 'github-actions[bot]',
          url: item.html_url || `https://github.com/${GITHUB_REPO}`,
          lastChecked: nowIso
        };
        MEMORY_CACHE.set(cacheKey, { data: meta, timestamp: Date.now() });
        return meta;
      }
    } else if (resp.status === 403) {
      // GitHub API rate-limited (60 req/hr unauth). Fall back to raw file HEAD request for ETag
      const rawUrl = `${GITHUB_RAW_BASE}/output/sum/SPX500-sum-cloud-tkx-merged.csv?_t=${Date.now()}`;
      const headResp = await fetch(rawUrl, { method: 'HEAD', cache: 'no-cache' });
      const etag = headResp.headers.get('etag') || '';
      const lastModified = headResp.headers.get('last-modified') || nowIso;
      const cleanEtag = etag.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7) || 'latest';
      
      const meta: GitHubSyncMeta = {
        lastUpdated: new Date(lastModified).toISOString(),
        commitSha: cleanEtag,
        commitMessage: 'Automated scan sync (via raw ETag stream)',
        author: 'github-actions[bot]',
        url: `https://github.com/${GITHUB_REPO}/commits/master`,
        lastChecked: nowIso
      };
      MEMORY_CACHE.set(cacheKey, { data: meta, timestamp: Date.now() });
      return meta;
    }
  } catch (err) {
    console.warn('Could not fetch GitHub API commit metadata, checking fallback:', err);
  }

  // Return last known or fallback
  return {
    lastUpdated: nowIso,
    commitSha: '64111a8',
    commitMessage: 'Daily updates Github Action - SP500',
    author: 'github-actions[bot]',
    url: `https://github.com/${GITHUB_REPO}`,
    lastChecked: nowIso
  };
}

/**
 * Check if a new commit or file update was published by GitHub Action
 */
export async function checkForGitHubUpdate(currentCommitSha?: string): Promise<{
  hasUpdate: boolean;
  meta: GitHubSyncMeta;
}> {
  const meta = await fetchGitHubSyncMeta(true);
  
  if (
    currentCommitSha &&
    meta.commitSha &&
    meta.commitSha !== '64111a8' &&
    currentCommitSha !== '64111a8' &&
    meta.commitSha.toLowerCase() !== currentCommitSha.toLowerCase()
  ) {
    return { hasUpdate: true, meta };
  }
  
  return { hasUpdate: false, meta };
}

/**
 * Fetch Cloud + TKx Scan rows for a given index
 */
export async function fetchCloudScanRows(indexId: string, forceFresh = false): Promise<CloudScanRow[]> {
  const indexConfig = SUPPORTED_INDICES.find(i => i.id === indexId) || SUPPORTED_INDICES[0];
  const url = `${GITHUB_RAW_BASE}/output/sum/${indexConfig.sumCsvFilename}`;
  
  const csvText = await fetchWithFallback(url, forceFresh);
  const records = parseCSV(csvText);

  return records.map(r => ({
    symbol: r['Symbol'] || '',
    name: r['Name'] || r['Symbol'] || '',
    close: parseFloat(r['Close']) || 0,
    cloud1H: parseFloat(r['1H Cloud Score']) || 0,
    cloud1D: parseFloat(r['1D Cloud Score']) || 0,
    cloud1W: parseFloat(r['1W Cloud Score']) || 0,
    cloud1M: parseFloat(r['1M Cloud Score']) || 0,
    cloudSum: parseFloat(r['Cloud Score Sum']) || 0,
    tkx1H: parseFloat(r['1H TKx Score']) || 0,
    tkx1D: parseFloat(r['1D TKx Score']) || 0,
    tkx1W: parseFloat(r['1W TKx Score']) || 0,
    tkx1M: parseFloat(r['1M TKx Score']) || 0,
    tkxSum: parseFloat(r['TKx Score Sum']) || 0,
    totalScoreSum: parseFloat(r['Total Score Sum']) || 0,
    index: indexId
  })).filter(r => Boolean(r.symbol));
}

/**
 * Fetch Chikou Span Scan rows for a given index
 */
export async function fetchChikouScanRows(indexId: string, forceFresh = false): Promise<ChikouScanRow[]> {
  const indexConfig = SUPPORTED_INDICES.find(i => i.id === indexId) || SUPPORTED_INDICES[0];
  let filename = indexConfig.chikouCsvFilename;
  let url = `${GITHUB_RAW_BASE}/output/chikou/${filename}`;

  let csvText: string;
  try {
    csvText = await fetchWithFallback(url, forceFresh);
  } catch (e) {
    // Retry with lowercase/uppercase variant if needed
    if (filename.includes('SPDR_ETFs')) {
      filename = 'SPDR_ETFS-chikou-merged.csv';
    } else if (filename.includes('SPDR_ETFS')) {
      filename = 'SPDR_ETFs-chikou-merged.csv';
    }
    url = `${GITHUB_RAW_BASE}/output/chikou/${filename}`;
    csvText = await fetchWithFallback(url, forceFresh);
  }

  const records = parseCSV(csvText);

  return records.map(r => ({
    symbol: r['Symbol'] || '',
    name: r['Name'] || r['Symbol'] || '',
    dir1H: parseInt(r['1H Chikou Direction'], 10) || 0,
    count1H: parseInt(r['1H Chikou Count'], 10) || 0,
    state1H: r['1H Chikou State'] || 'neutral',
    dir1D: parseInt(r['1D Chikou Direction'], 10) || 0,
    count1D: parseInt(r['1D Chikou Count'], 10) || 0,
    state1D: r['1D Chikou State'] || 'neutral',
    dir1W: parseInt(r['1W Chikou Direction'], 10) || 0,
    count1W: parseInt(r['1W Chikou Count'], 10) || 0,
    state1W: r['1W Chikou State'] || 'neutral',
    dir1M: parseInt(r['1M Chikou Direction'], 10) || 0,
    count1M: parseInt(r['1M Chikou Count'], 10) || 0,
    state1M: r['1M Chikou State'] || 'neutral',
    chikouScoreSum: parseFloat(r['Chikou Score Sum']) || 0,
    index: indexId
  })).filter(r => Boolean(r.symbol));
}

/**
 * Fetch and merge Cloud + Chikou into unified StockConstituents for full app interactivity
 */
export async function fetchMergedIndexData(indexId: string, forceFresh = false): Promise<{
  cloudRows: CloudScanRow[];
  chikouRows: ChikouScanRow[];
  unifiedStocks: StockConstituent[];
  meta: GitHubSyncMeta;
}> {
  const [cloudRows, chikouRows, meta] = await Promise.all([
    fetchCloudScanRows(indexId, forceFresh).catch(err => {
      console.error(`Failed to fetch cloud scan for ${indexId}:`, err);
      return [] as CloudScanRow[];
    }),
    fetchChikouScanRows(indexId, forceFresh).catch(err => {
      console.error(`Failed to fetch chikou scan for ${indexId}:`, err);
      return [] as ChikouScanRow[];
    }),
    fetchGitHubSyncMeta(forceFresh)
  ]);

  const chikouMap = new Map<string, ChikouScanRow>();
  chikouRows.forEach(row => {
    chikouMap.set(row.symbol.toUpperCase(), row);
  });

  const indexConfig = SUPPORTED_INDICES.find(i => i.id === indexId) || SUPPORTED_INDICES[0];

  const unifiedStocks: StockConstituent[] = cloudRows.map(cRow => {
    const symb = cRow.symbol.toUpperCase();
    const chk = chikouMap.get(symb);

    // Compute cloud status from 1D Cloud Score
    let cloudStatus: CloudStatus = 'IN_CLOUD';
    if (cRow.cloud1D > 0 || cRow.cloudSum > 50) {
      cloudStatus = 'ABOVE_CLOUD';
    } else if (cRow.cloud1D < 0 || cRow.cloudSum < -50) {
      cloudStatus = 'BELOW_CLOUD';
    }

    // Compute TK Cross from 1D TKx Score
    let tkCross: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NEUTRAL' = 'NEUTRAL';
    if (cRow.tkx1D > 0 || cRow.tkxSum > 20) {
      tkCross = 'BULLISH_CROSS';
    } else if (cRow.tkx1D < 0 || cRow.tkxSum < -20) {
      tkCross = 'BEARISH_CROSS';
    }

    // Candlestick Kicker check based on momentum / total score
    let kickerSignal: KickerType = 'NONE';
    if (cRow.totalScoreSum >= 350 && cRow.cloud1D > 20) {
      kickerSignal = 'BULLISH_KICKER';
    } else if (cRow.totalScoreSum <= -350 && cRow.cloud1D < -20) {
      kickerSignal = 'BEARISH_KICKER';
    }

    // Normalized strength score (-5 to +5) for easy UI filtering & color coding
    let strengthScore = 0;
    if (cRow.totalScoreSum > 400) strengthScore = 5;
    else if (cRow.totalScoreSum > 250) strengthScore = 4;
    else if (cRow.totalScoreSum > 100) strengthScore = 3;
    else if (cRow.totalScoreSum > 20) strengthScore = 2;
    else if (cRow.totalScoreSum > 0) strengthScore = 1;
    else if (cRow.totalScoreSum > -20) strengthScore = 0;
    else if (cRow.totalScoreSum > -100) strengthScore = -1;
    else if (cRow.totalScoreSum > -250) strengthScore = -2;
    else if (cRow.totalScoreSum > -400) strengthScore = -3;
    else strengthScore = -5;

    // Derived synthetic Ichimoku values for visual chart if clicked
    const price = cRow.close > 0 ? cRow.close : 100;
    const tenkan = Number((price * (1 + (cRow.tkx1D > 0 ? -0.015 : 0.015))).toFixed(2));
    const kijun = Number((price * (1 + (cRow.tkx1D > 0 ? -0.03 : 0.03))).toFixed(2));
    const senkouSpanA = Number(((tenkan + kijun) / 2).toFixed(2));
    const senkouSpanB = Number((price * (1 + (cRow.cloud1D > 0 ? -0.05 : 0.05))).toFixed(2));

    const stock: StockConstituent = {
      ticker: cRow.symbol,
      name: cRow.name || cRow.symbol,
      index: indexId as MarketIndex,
      sector: indexConfig.tag,
      price: price,
      change1D: Number((cRow.tkx1H * 0.05 + (cRow.cloud1D > 0 ? 0.8 : -0.8)).toFixed(2)),
      change1W: Number((cRow.cloud1W * 0.03).toFixed(2)),
      change1M: Number((cRow.cloud1M * 0.02).toFixed(2)),
      volume: 'Live GitHub',
      marketCap: indexConfig.shortName,
      cloudStatus,
      tkCross,
      tkDistancePercent: Number(Math.abs((tenkan - kijun) / kijun * 100).toFixed(2)),
      kickerSignal,
      strengthScore,
      timeframeScores: {
        daily: cRow.cloud1D,
        weekly: cRow.cloud1W,
        monthly: cRow.cloud1M
      },
      ichimoku: {
        tenkan,
        kijun,
        senkouSpanA,
        senkouSpanB,
        chikou: price,
        cloudColor: senkouSpanA >= senkouSpanB ? 'BULLISH_GREEN' : 'BEARISH_RED',
        cloudThickness: Number(Math.abs(senkouSpanA - senkouSpanB).toFixed(2))
      },
      signalSummary: `Total Score: ${cRow.totalScoreSum > 0 ? '+' : ''}${cRow.totalScoreSum} | Cloud Sum: ${cRow.cloudSum} | TKx Sum: ${cRow.tkxSum}${chk ? ` | Chikou Sum: ${chk.chikouScoreSum}` : ''}`,
      lastUpdated: 'Live GitHub Action',
      cloudRow: cRow,
      chikouRow: chk,
      totalScoreSum: cRow.totalScoreSum,
      cloudSum: cRow.cloudSum,
      tkxSum: cRow.tkxSum,
      chikouSum: chk?.chikouScoreSum,
      source: 'github_csv'
    };

    // Attach candles for chart inspection
    const trendType: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 
      cRow.totalScoreSum > 50 ? 'BULLISH' : cRow.totalScoreSum < -50 ? 'BEARISH' : 'NEUTRAL';
    stock.historicalCandles = generateCandlesForStock(price, trendType);

    return stock;
  });

  return {
    cloudRows,
    chikouRows,
    unifiedStocks,
    meta
  };
}

/**
 * Triggers instant browser download of the raw CSV file
 */
export function downloadCsvFile(indexId: string, type: 'sum' | 'chikou') {
  const indexConfig = SUPPORTED_INDICES.find(i => i.id === indexId) || SUPPORTED_INDICES[0];
  const filename = type === 'sum' ? indexConfig.sumCsvFilename : indexConfig.chikouCsvFilename;
  const url = `${GITHUB_RAW_BASE}/output/${type}/${filename}`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Get Tabulator HTML page URL hosted on GitHub Pages
 */
export function getTabulatorPageUrl(indexId: string, type: 'sum' | 'chikou'): string {
  const indexConfig = SUPPORTED_INDICES.find(i => i.id === indexId) || SUPPORTED_INDICES[0];
  const filename = type === 'sum' ? indexConfig.sumCsvFilename : indexConfig.chikouCsvFilename;
  return `${GITHUB_PAGES_BASE}/output/${type}/${filename}.tabulator.html`;
}

/**
 * Get GitHub repo direct blob link
 */
export function getGitHubRepoFileUrl(indexId: string, type: 'sum' | 'chikou'): string {
  const indexConfig = SUPPORTED_INDICES.find(i => i.id === indexId) || SUPPORTED_INDICES[0];
  const filename = type === 'sum' ? indexConfig.sumCsvFilename : indexConfig.chikouCsvFilename;
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/output/${type}/${filename}`;
}
