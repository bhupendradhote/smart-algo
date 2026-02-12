import {
  getHistoricalDataService,
  getMarketDataService,
} from "../../services/angelServices/historicalQuote.service.js";
import { BrokerAccountModel } from "../../models/brokerAccounts.js";
import { connectAngelService } from "../../services/angelServices/connect.service.js"; 
import crypto from "crypto";

// Decryption utility to unlock the keys from the database
const decryptData = (hash) => {
  if (!hash || typeof hash !== "string" || !hash.includes(":")) return hash; 
  
  try {
    const parts = hash.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(process.env.ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed! Check your ENCRYPTION_KEY in .env:", error.message);
    throw new Error("Failed to decrypt broker credentials.");
  }
};

// Helper to get keys AND automatically reconnect if the token is missing
const getAngelCredentials = async (userId, req) => {
  console.log(`[Angel Auth] Fetching credentials for user ID: ${userId}`);

  const accounts = await BrokerAccountModel.findByUserId(userId);
  const angelAccount = accounts.find((acc) => 
    acc.broker_name?.toUpperCase() === "ANGEL"
  );
  
  if (!angelAccount || !angelAccount.api_key) {
    throw new Error("Angel broker account not found. Please connect your account.");
  }

  // Decrypt the credentials into plain text for the API call
  const plainApiKey = decryptData(angelAccount.api_key);
  const plainMpin = decryptData(angelAccount.mpin);
  const plainTotpSecret = decryptData(angelAccount.totp_secret_hash || angelAccount.totp_secret);

  const sessionTokens = req.session?.angelTokens;
  const isSessionValid = sessionTokens?.jwtToken && sessionTokens?.userId === userId;

  if (!isSessionValid) {
    console.log("[Angel Auth] Session missing, expired, or belongs to another user. Auto-reconnecting...");
    try {
      const { tokenData } = await connectAngelService({
        apiKey: plainApiKey,
        clientCode: angelAccount.client_code, 
        password: plainMpin,
        totpSecret: plainTotpSecret
      });

      // Save new tokens and securely bind them to THIS user
      req.session.angelTokens = {
        userId: userId, 
        jwtToken: tokenData.jwtToken,
        refreshToken: tokenData.refreshToken,
        feedToken: tokenData.feedToken,
      };
      
      console.log("[Angel Auth] ✅ Auto-reconnect successful!");
      return { apiKey: plainApiKey, jwtToken: tokenData.jwtToken };

    } catch (err) {
      console.error("[Angel Auth] Auto-reconnect failed:", err.message);
      throw new Error("Auto-reconnect failed: " + err.message);
    }
  }

  console.log("[Angel Auth] Valid active session found. Proceeding with request.");
  return { apiKey: plainApiKey, jwtToken: sessionTokens.jwtToken };
};

// GET HISTORICAL DATA
export const getHistoricalData = async (req, res) => {
  try {
    console.log("[Controller] Hit /historical-data");
    const { exchange, symbolToken, interval, fromDate, toDate } = req.body;
    
    if (!req.user || !req.user.id) {
       console.error("[Controller] req.user is missing! Your authMiddleware is failing.");
       return res.status(401).json({ success: false, message: "Unauthorized: App user token missing." });
    }

    const userId = req.user.id; 

    if (!symbolToken || !interval || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters: symbolToken, interval, fromDate, or toDate",
      });
    }

    const { apiKey, jwtToken } = await getAngelCredentials(userId, req);

    const data = await getHistoricalDataService({
      apiKey,
      jwtToken,
      exchange: exchange || "NSE",
      symbolToken,
      interval,
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      message: `Fetched ${data.length} candles successfully`,
      data: data,
    });
  } catch (error) {
    console.error("[Controller Historical Error]:", error.message);
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// GET MARKET DATA
export const getMarketData = async (req, res) => {
  try {
    console.log("[Controller] Hit /market-data");
    const { mode, exchangeTokens } = req.body;
    
    if (!req.user || !req.user.id) {
       console.error("[Controller] req.user is missing! Your authMiddleware is failing.");
       return res.status(401).json({ success: false, message: "Unauthorized: App user token missing." });
    }

    const userId = req.user.id; 

    if (!exchangeTokens) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: exchangeTokens",
      });
    }

    const { apiKey, jwtToken } = await getAngelCredentials(userId, req);

    const data = await getMarketDataService({
      apiKey,
      jwtToken,
      mode,
      exchangeTokens,
    });

    return res.status(200).json({
      success: true,
      message: "Market data fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("[Controller MarketData Error]:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};