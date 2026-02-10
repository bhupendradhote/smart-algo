import { calculateSMA } from "../../services/indicators/sma.service.js";
import { calculateEMA } from "../../services/indicators/ema.service.js";
import { calculateWMA } from "../../services/indicators/wma.service.js";
import { calculateSMMA } from "../../services/indicators/smma.service.js";
import { calculateHMA } from "../../services/indicators/hma.service.js";
import { calculateVWAP } from "../../services/indicators/vwap.service.js";

import { calculateMACD } from "../../services/indicators/macd.service.js";
import { calculateRSI } from "../../services/indicators/rsi.service.js";
import { calculateStochastic } from "../../services/indicators/stochastic.service.js";
import { calculateCCI } from "../../services/indicators/cci.service.js";
  
import { calculateBollingerBands } from "../../services/indicators/bollinger.service.js";
import { calculateATR } from "../../services/indicators/atr.service.js";
import { calculateDonchian } from "../../services/indicators/donchian.service.js";

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, e) =>
  res.status(500).json({ success: false, message: e.message });

export const getSMA = (req, res) => { try { ok(res, calculateSMA(req.body)); } catch (e) { fail(res, e); } };
export const getEMA = (req, res) => { try { ok(res, calculateEMA(req.body)); } catch (e) { fail(res, e); } };
export const getWMA = (req, res) => { try { ok(res, calculateWMA(req.body)); } catch (e) { fail(res, e); } };
export const getSMMA = (req, res) => { try { ok(res, calculateSMMA(req.body)); } catch (e) { fail(res, e); } };
export const getHMA = (req, res) => { try { ok(res, calculateHMA(req.body)); } catch (e) { fail(res, e); } };
export const getVWAP = (req, res) => { try { ok(res, calculateVWAP(req.body)); } catch (e) { fail(res, e); } };

export const getMACD = (req, res) => { try { ok(res, calculateMACD(req.body)); } catch (e) { fail(res, e); } };
export const getRSI = (req, res) => { try { ok(res, calculateRSI(req.body)); } catch (e) { fail(res, e); } };
export const getStochastic = (req, res) => { try { ok(res, calculateStochastic(req.body)); } catch (e) { fail(res, e); } };
export const getCCI = (req, res) => { try { ok(res, calculateCCI(req.body)); } catch (e) { fail(res, e); } };

export const getBBands = (req, res) => { try { ok(res, calculateBollingerBands(req.body)); } catch (e) { fail(res, e); } };
export const getATR = (req, res) => { try { ok(res, calculateATR(req.body)); } catch (e) { fail(res, e); } };
export const getDonchian = (req, res) => { try { ok(res, calculateDonchian(req.body)); } catch (e) { fail(res, e); } };
