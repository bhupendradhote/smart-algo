// src/controllers/angelController/brokerAccountsController.js
import { BrokerAccountModel } from "../../models/brokerAccounts.js";

// ADD BROKER ACCOUNT
export const addBrokerAccount = async (req, res) => {
  try {
    // 1. Get user ID from your auth middleware
    const userId = req.user.id; 

    const { 
      broker_name, 
      api_key, 
      client_code, 
      totp_secret, 
      mpin // Grab mpin from the request
    } = req.body;

    if (!broker_name || !api_key || !client_code || !mpin) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: broker_name, api_key, client_code, or mpin",
      });
    }

    // Check for existing account to prevent duplicates
    const exists = await BrokerAccountModel.exists(userId, broker_name, client_code);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "This broker account is already linked to your profile.",
      });
    }

    // Save to database
    const accountId = await BrokerAccountModel.create({
      user_id: userId,
      broker_name,
      api_key,
      client_code,
      totp_secret,
      mpin, 
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Broker account added successfully",
      data: { id: accountId }
    });

  } catch (error) {
    console.error("Add Broker Account Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add broker account",
      error: error.message
    });
  }
};

// GET USER BROKER ACCOUNTS
export const getBrokerAccounts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const userId = req.user.id;
    const accounts = await BrokerAccountModel.findByUserId(userId);

    return res.status(200).json({
      data: accounts,
    });
  } catch (error) {
    console.error("Get broker accounts error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL DATA (No Validation)
export const getAllBrokerAccountsData = async (req, res) => {
  try {
    const allAccounts = await BrokerAccountModel.findAll();

    return res.status(200).json({
      data: allAccounts,
    });
  } catch (error) {
    console.error("Get all broker data error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE BROKER STATUS
export const updateBrokerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const account = await BrokerAccountModel.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Broker account not found",
      });
    }

    await BrokerAccountModel.updateStatus(id, status);

    return res.status(200).json({
      message: "Broker account status updated",
    });
  } catch (error) {
    console.error("Update broker status error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE BROKER ACCOUNT
export const deleteBrokerAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BrokerAccountModel.findById(id);
    if (!account) {
      return res.status(404).json({
        message: "Broker account not found",
      });
    }

    await BrokerAccountModel.delete(id);

    return res.status(200).json({
      message: "Broker account deleted successfully",
    });
  } catch (error) {
    console.error("Delete broker account error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};