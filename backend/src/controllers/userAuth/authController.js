import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in .env");
  process.exit(1);
}

/* =========================
   HELPERS
========================= */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^\d{10}$/.test(phone); // India-style 10 digit

const isStrongPassword = (password) =>
  typeof password === "string" && password.length >= 6;

/* =========================
   REGISTER
========================= */

export const register = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    // ---- Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // ---- Normalize
    name = name.trim();
    email = email.trim().toLowerCase();
    phone = phone ? phone.trim() : null;

    // ---- Validations
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        message: "Phone must be 10 digits",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ---- Duplicate email check
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // ---- Duplicate phone check (IMPORTANT FIX)
    if (phone) {
      const existingPhone = await UserModel.findByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({
          message: "Phone number already registered",
        });
      }
    }

    // ---- Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // ---- Create user
    const userId = await UserModel.create({
      name,
      email,
      phone,
      password_hash,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // ---- DB unique constraint safety (race condition)
    if (error?.errno === 1062) {
      if (error.sqlMessage?.includes("email")) {
        return res.status(409).json({ message: "Email already registered" });
      }
      if (error.sqlMessage?.includes("phone")) {
        return res.status(409).json({ message: "Phone number already registered" });
      }
      return res.status(409).json({ message: "Duplicate entry" });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   LOGIN
========================= */

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive or blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await UserModel.updateLastLogin(user.id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
