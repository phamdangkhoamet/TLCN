import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function getUserFromAuthHeader(req) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer ")) return null;
    const token = h.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const u = await User.findById(payload.id);
    return u || null;
  } catch {
    return null;
  }
}
