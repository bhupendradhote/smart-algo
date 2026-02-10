import { calculateSMA } from "./sma.service.js";
import { calculateEMA } from "./ema.service.js";
import { calculateWMA } from "./wma.service.js";
import { calculateSMMA } from "./smma.service.js";
import { calculateHMA } from "./hma.service.js";
import { calculateVWAP } from "./vwap.service.js";

import { calculateMACD } from "./macd.service.js";
import { calculateRSI } from "./rsi.service.js";
import { calculateStochastic } from "./stochastic.service.js";
import { calculateCCI } from "./cci.service.js";

import { calculateBollingerBands } from "./bollinger.service.js";
import { calculateATR } from "./atr.service.js";
import { calculateDonchian } from "./donchian.service.js";

export const indicatorFunctions = {
  sma: calculateSMA,
  ema: calculateEMA,
  wma: calculateWMA,
  smma: calculateSMMA,
  hma: calculateHMA,
  vwap: calculateVWAP,

  macd: calculateMACD,
  rsi: calculateRSI,
  stochastic: calculateStochastic,
  cci: calculateCCI,

  bbands: calculateBollingerBands,
  atr: calculateATR,
  donchian: calculateDonchian,
};
