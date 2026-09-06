import { CandleData, IchimokuValues } from '../types';

/**
 * Calculates Ichimoku Kinko Hyo components given historical candle data
 * - Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
 * - Kijun-sen (Base Line): (26-period high + 26-period low) / 2
 * - Senkou Span A (Leading Span A): (Tenkan + Kijun) / 2 plotted 26 periods ahead
 * - Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2 plotted 26 periods ahead
 * - Chikou Span (Lagging Span): Close plotted 26 periods behind
 */
export function calculateIchimoku(candles: CandleData[]): CandleData[] {
  const result: CandleData[] = candles.map(c => ({ ...c }));

  for (let i = 0; i < result.length; i++) {
    // 1. Tenkan-sen (9 periods)
    if (i >= 8) {
      let high9 = -Infinity;
      let low9 = Infinity;
      for (let j = i - 8; j <= i; j++) {
        high9 = Math.max(high9, result[j].high);
        low9 = Math.min(low9, result[j].low);
      }
      result[i].tenkan = Number(((high9 + low9) / 2).toFixed(2));
    }

    // 2. Kijun-sen (26 periods)
    if (i >= 25) {
      let high26 = -Infinity;
      let low26 = Infinity;
      for (let j = i - 25; j <= i; j++) {
        high26 = Math.max(high26, result[j].high);
        low26 = Math.min(low26, result[j].low);
      }
      result[i].kijun = Number(((high26 + low26) / 2).toFixed(2));
    }

    // 3. Senkou Span A = (Tenkan + Kijun) / 2
    if (result[i].tenkan !== undefined && result[i].kijun !== undefined) {
      result[i].senkouSpanA = Number(((result[i].tenkan! + result[i].kijun!) / 2).toFixed(2));
    }

    // 4. Senkou Span B (52 periods)
    if (i >= 51) {
      let high52 = -Infinity;
      let low52 = Infinity;
      for (let j = i - 51; j <= i; j++) {
        high52 = Math.max(high52, result[j].high);
        low52 = Math.min(low52, result[j].low);
      }
      result[i].senkouSpanB = Number(((high52 + low52) / 2).toFixed(2));
    }

    // 5. Chikou Span = current close
    result[i].chikou = result[i].close;
  }

  return result;
}

/**
 * Generates realistic synthetic 60-day historical daily candles tailored for a ticker
 */
export function generateCandlesForStock(
  basePrice: number,
  trendType: 'BULLISH' | 'BEARISH' | 'NEUTRAL',
  volatility = 0.015
): CandleData[] {
  const candles: CandleData[] = [];
  const days = 60;
  const now = new Date();

  let price = basePrice;
  const drift = trendType === 'BULLISH' ? 0.0025 : trendType === 'BEARISH' ? -0.0025 : 0.0002;

  // Generate backward or forward
  const rawData: { date: string; open: number; high: number; low: number; close: number; volume: number }[] = [];

  // Start from initial estimate
  let currPrice = basePrice * (1 - drift * days * 0.7);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Skip weekends
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split('T')[0];
    const changePct = (Math.random() - 0.48) * volatility * 2 + drift;
    const open = Number(currPrice.toFixed(2));
    currPrice = currPrice * (1 + changePct);
    const close = Number(currPrice.toFixed(2));
    const range = Math.abs(open - close) + currPrice * volatility * 0.5;
    const high = Number((Math.max(open, close) + Math.random() * range).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * range).toFixed(2));
    const volume = Math.floor(2000000 + Math.random() * 8000000);

    rawData.push({
      date: dateStr,
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume
    });
  }

  // Adjust last candle close to match basePrice
  if (rawData.length > 0) {
    const last = rawData[rawData.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, last.close);
    last.low = Math.min(last.low, last.close);
  }

  return calculateIchimoku(rawData);
}
