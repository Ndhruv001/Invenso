// middlewares/authMiddleware.js
import { verifyToken } from "../utils/jwt.js";
import AppError from "../utils/appErrorUtils.js";

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = null;
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Authentication required", 401, "NO_TOKEN_PROVIDED");
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (err) {
    // If it's already an AppError, bubble it
    if (err instanceof AppError) {
      return next(err);
    }

    // Otherwise wrap into AppError
    return next(new AppError("Unauthorized", 401, "AUTH_ERROR"));
  }
};

export default authMiddleware;
export { authMiddleware };
