// src/models/brokerAccounts.js
import { getDB } from "../config/db.js";

export const BrokerAccountModel = {
  // CREATE
  async create(account) {
    const db = getDB();

    const sql = `
      INSERT INTO broker_accounts
      (user_id, broker_name, api_key, client_code, totp_secret_hash, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      account.user_id,
      account.broker_name,
      account.api_key,
      account.client_code,
      account.totp_secret, 
      account.status || "active",
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
  },

  // FIND BY USER
  async findByUserId(userId) {
    const db = getDB();
    
    const sql = `
      SELECT 
        id, 
        user_id, 
        broker_name, 
        client_code, 
        api_key, 
        totp_secret_hash, 
        status, 
        created_at
      FROM broker_accounts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  // FIND ALL (No Validation)
  async findAll() {
    const db = getDB();
    const sql = `
      SELECT 
        id, 
        user_id, 
        broker_name, 
        client_code, 
        api_key, 
        totp_secret_hash, 
        status, 
        created_at
      FROM broker_accounts
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // FIND SINGLE ACCOUNT
  async findById(id) {
    const db = getDB();

    const sql = `
      SELECT *
      FROM broker_accounts
      WHERE id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);
    
    if (rows[0]) {
        rows[0].totp_secret = rows[0].totp_secret_hash; 
    }
    
    return rows[0];
  },

  // CHECK DUPLICATE
  async exists(userId, brokerName, clientCode) {
    const db = getDB();

    const sql = `
      SELECT id
      FROM broker_accounts
      WHERE user_id = ? AND broker_name = ? AND client_code = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [
      userId,
      brokerName,
      clientCode,
    ]);

    return rows.length > 0;
  },

  // UPDATE STATUS
  async updateStatus(id, status) {
    const db = getDB();

    const sql = `
      UPDATE broker_accounts
      SET status = ?
      WHERE id = ?
    `;

    await db.query(sql, [status, id]);
  },

  // DELETE ACCOUNT
  async delete(id) {
    const db = getDB();  

    const sql = `DELETE FROM broker_accounts WHERE id = ?`;
    await db.query(sql, [id]);
  },
};