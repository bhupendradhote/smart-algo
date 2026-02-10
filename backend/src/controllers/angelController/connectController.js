// backend/src/controllers/angelController/connectController.js
import { connectAngelService } from "../../services/angelServices/connect.service.js";

export const connectController = async (req, res) => {
  try {
    // 1. Destructure Inputs
    const body = req.body || {};
    const apiKey = body.apiKey || body.api_key;
    const clientCode = body.clientCode || body.client_code;
    const password = body.password || body.mpin; // sometimes sent as mpin
    const totp = body.totp;
    const totpSecret = body.totpSecret || body.totp_secret;

    // 2. Validate Controller Level Inputs
    if (!apiKey || !clientCode || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: apiKey, clientCode, or password",
      });
    }

    // 3. Call Service
    const { tokenData, profile } = await connectAngelService({
      apiKey,
      clientCode,
      password,
      totp,
      totpSecret,
    });

    // 4. Success Response
    return res.status(200).json({
      success: true,
      message: "Connected successfully",
      data: {
        tokenData,
        profile,
      },
    });

  } catch (err) {
    console.error("connectController Error:", err.message);
    
    // 5. Error Response
    const statusCode = err.message.includes("Login Failed") || err.message.includes("Invalid") ? 401 : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};