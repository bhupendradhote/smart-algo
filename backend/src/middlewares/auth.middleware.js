// backend/src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // DEBUG LOG
    console.log("🔍 Middleware received Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Header missing or invalid format");
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};