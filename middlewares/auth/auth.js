import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Access denied. Only admins are allowed." });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (!req.user.isAdmin || req.user.role !== "SuperAdmin") {
    return res
      .status(403)
      .json({ message: "Access denied. Only Super Admins are allowed." });
  }
  next();
};

export default auth;
