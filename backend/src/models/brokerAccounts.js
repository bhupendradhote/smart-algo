// src/models/brokerAccounts.js
import { getDB } from "../config/db.js";
import { encrypt, decrypt } from "../utils/encryption.js"; // ✨ ADDED: Utility imports

export const BrokerAccountModel = {
  // CREATE
  async create(account) {
    const db = getDB();

    // ✨ UPDATED: Added mpin to the SQL statement
    const sql = `
      INSERT INTO broker_accounts
      (user_id, broker_name, api_key, client_code, totp_secret_hash, mpin, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // ✨ UPDATED: Encrypting the sensitive fields before database insertion
    const values = [
      account.user_id,
      account.broker_name,
      encrypt(account.api_key), 
      account.client_code, // client_code is generally safe unencrypted
      encrypt(account.totp_secret), 
      encrypt(account.mpin),
      account.status || "active",
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
  },

  // FIND BY USER
  async findByUserId(userId) {
    const db = getDB();
    
    // ✨ UPDATED: Added mpin to the SELECT statement
    const sql = `
      SELECT 
        id, 
        user_id, 
        broker_name, 
        client_code, 
        api_key, 
        totp_secret_hash, 
        mpin,
        status, 
        created_at
      FROM broker_accounts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await db.query(sql, [userId]);

    // ✨ UPDATED: Decrypt rows before returning
    return rows.map(row => {
      row.api_key = decrypt(row.api_key);
      row.totp_secret_hash = decrypt(row.totp_secret_hash);
      row.mpin = decrypt(row.mpin);
      return row;
    });
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
        mpin,
        status, 
        created_at
      FROM broker_accounts
    `;
    const [rows] = await db.query(sql);

    // ✨ UPDATED: Decrypt rows
    return rows.map(row => {
      row.api_key = decrypt(row.api_key);
      row.totp_secret_hash = decrypt(row.totp_secret_hash);
      row.mpin = decrypt(row.mpin);
      return row;
    });
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
        // ✨ UPDATED: Decrypt fields and map totp_secret correctly
        rows[0].api_key = decrypt(rows[0].api_key);
        rows[0].totp_secret = decrypt(rows[0].totp_secret_hash); 
        rows[0].mpin = decrypt(rows[0].mpin);
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