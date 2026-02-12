// backend/src/services/angelServices/connect.service.js
import { SmartAPI } from "smartapi-javascript";
import speakeasy from "speakeasy";

export const connectAngelService = async ({
  apiKey,
  clientCode,
  password,
  totp,
  totpSecret,
}) => {
  if (!apiKey || !clientCode || !password) {
    throw new Error("apiKey, clientCode, and password (MPIN) are required");
  }

  try {
    let totpToUse = undefined;

    if (totpSecret) {
      const cleanSecret = String(totpSecret).replace(/\s+/g, "");
      
      totpToUse = speakeasy.totp({
        secret: cleanSecret,
        encoding: "base32",
        step: 30,
        digits: 6,
      });
    } else if (totp) {
      totpToUse = String(totp).trim();
    }

    if (!totpToUse) {
      throw new Error("Either TOTP or TOTP Secret is required to connect");
    }

    const smartApi = new SmartAPI({ api_key: apiKey });

    const session = await smartApi.generateSession(clientCode, password, totpToUse);

    // ✨ ADDED: Debug log to see EXACTLY what Angel One returns
    console.log("Angel API Raw Response:", JSON.stringify(session));

    if (!session) {
      throw new Error("No response received from Angel SmartAPI");
    }

    // ✨ UPDATED: More robust check for failed status
    // Handles false, "false", null, or completely missing status
    if (!session.status || session.status === false || session.status === "false") {
      const msg = session.message || session.errorcode || "Angel login failed. Check credentials.";
      throw new Error(msg);
    }

    const tokens = session.data;
    if (!tokens || !tokens.jwtToken) {
      throw new Error("Login successful but tokens are missing in response");
    }

    const tokenData = {
      jwtToken: tokens.jwtToken,
      refreshToken: tokens.refreshToken || null,
      feedToken: tokens.feedToken || null,
    };

    let profile = null;
    try {
      profile = await smartApi.getProfile();
    } catch (e) {
      console.warn("Failed to fetch profile after login:", e.message);
      profile = null; 
    }

    return { tokenData, profile };

  } catch (err) {
    const message = err.message || "Angel SmartAPI connection service failed";
    console.error("Angel connect service error:", message);
    throw new Error(message);
  }
};