// utils/password.js
import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

/**
 * Hash a plain text password
 */
async function hashPassword(password) {
  if (!password) throw new Error("Password is required");
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hashed password
 */
async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) throw new Error("Password & hash required");
  return await bcrypt.compare(password, hashedPassword);
}

export default { hashPassword, comparePassword };
export { hashPassword, comparePassword };
