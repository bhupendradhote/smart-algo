// backend/src/utils/indicators/vwapCalculator.js

export default function vwapCalculator(candles = [], params = {}) {
  if (!Array.isArray(candles) || candles.length === 0) return [];

  const sourceType = (params.source || "hlc3").toLowerCase();
  const resetDaily = params.resetDaily !== false; // default true

  let cumulativePV = 0;
  let cumulativeVolume = 0;
  let lastDate = null;

  const result = [];

  for (const candle of candles) {
    const time = Number(candle.time);
    const open = Number.isFinite(candle.open) ? Number(candle.open) : Number(candle.close || 0);
    const high = Number.isFinite(candle.high) ? Number(candle.high) : Number(candle.close || open);
    const low = Number.isFinite(candle.low) ? Number(candle.low) : Number(candle.close || open);
    const close = Number.isFinite(candle.close) ? Number(candle.close) : open;
    const volume = Number.isFinite(candle.volume) ? Number(candle.volume) : 0;

    if (!Number.isFinite(time) || !Number.isFinite(close)) continue;

    if (resetDaily) {
      const currentDate = new Date(time * 1000).toDateString();
      if (lastDate && currentDate !== lastDate) {
        cumulativePV = 0;
        cumulativeVolume = 0;
      }
      lastDate = currentDate;
    }

    let price = close;
    switch (sourceType) {
      case "hl2":
        price = (high + low) / 2;
        break;
      case "hlc3":
        price = (high + low + close) / 3;
        break;
      case "ohlc4":
        price = (open + high + low + close) / 4;
        break;
      case "close":
      default:
        price = close;
    }

    cumulativePV += price * volume;
    cumulativeVolume += volume;

    const vwap = cumulativeVolume > 0 ? cumulativePV / cumulativeVolume : null;

    result.push({
      time,
      value: vwap !== null && Number.isFinite(vwap) ? Number(Number(vwap).toFixed(8)) : null,
    });
  }

  return result;
}
