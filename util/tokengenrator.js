import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET;

const generateToken = (payload, expiresIn = "1d") => {
  try {
    const token = jwt.sign(payload, secretKey, { expiresIn });
    return token;   
  } catch (error) {
    console.error("Error generating JWT token:", error.message);
    return null;
  }
};

export default generateToken;
