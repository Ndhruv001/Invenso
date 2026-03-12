// services/auth.service.js
import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

const loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const match = await comparePassword(password, user.password);
  if (!match) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const token = generateToken({ id: user.id, username: user.username });
  return { token, user };
};

export default { loginUser  };
export { loginUser };
