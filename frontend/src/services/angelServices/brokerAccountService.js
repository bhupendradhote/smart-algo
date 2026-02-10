//frontend\src\services\angelServices\brokerAccountService.js

import API from "../api/axios";

// ADD BROKER ACCOUNT
export const addBrokerAccount = async (payload) => {
  try {
    const { data } = await API.post("/angel/broker-accounts", payload);
    return data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to add broker account",
      }
    );
  }
};

// GET BROKER ACCOUNTS
export const getBrokerAccounts = async () => {
  try {
    const { data } = await API.get("/angel/broker-accounts");
    return data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch broker accounts",
      }
    );
  }
};

// UPDATE STATUS
export const updateBrokerAccountStatus = async (id, status) => {
  try {
    const { data } = await API.patch(
      `/angel/broker-accounts/${id}/status`,
      { status }
    );
    return data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to update broker account status",
      }
    );
  }
};

// DELETE
export const deleteBrokerAccount = async (id) => {
  try {
    const { data } = await API.delete(`/angel/broker-accounts/${id}`);
    return data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to delete broker account",
      }
    );
  }
};
