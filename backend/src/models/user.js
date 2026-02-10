// src/models/user.js
import { getDB } from "../config/db.js";

export const UserModel = {
  /* =========================
     CREATE USER
  ========================= */
  async create(user) {
    const db = getDB();

    const sql = `
      INSERT INTO users 
      (name, email, phone, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user.name,
      user.email,
      user.phone || null,
      user.password_hash,
      user.role || "user",
      user.status || "active",
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
  },

  /* =========================
     FIND BY EMAIL
  ========================= */
  async findByEmail(email) {
    const db = getDB();

    const sql = `
      SELECT * FROM users 
      WHERE email = ? AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [email]);
    return rows[0];
  },

  /* =========================
     FIND BY PHONE
  ========================= */
  async findByPhone(phone) {
    const db = getDB();

    const sql = `
      SELECT id FROM users
      WHERE phone = ? AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [phone]);
    return rows[0];
  },

  /* =========================
     FIND BY ID
  ========================= */
  async findById(id) {
    const db = getDB();

    const sql = `
      SELECT * FROM users 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  /* =========================
     UPDATE LAST LOGIN
  ========================= */
  async updateLastLogin(id) {
    const db = getDB();

    const sql = `
      UPDATE users 
      SET last_login_at = NOW() 
      WHERE id = ?
    `;

    await db.query(sql, [id]);
  },
};
