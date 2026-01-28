import { validationResult } from "express-validator";
import AppError from "../utils/appErrorUtils.js";
import asyncHandler from "../utils/asyncHandlerUtils.js";

const validateRequest = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors
      .array()
      .map(e => `${e.param}: ${e.msg}`)
      .join("--------> ");
    console.log("🚀 ~ errorMsg:", errorMsg)//& try to hide this in production
    return next(
      new AppError("Invalid request data", 400, `Validation error: ${errorMsg}`, {
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
        errors: errors.array()
      })
    );
  }
  next();
});

export default validateRequest;
export { validateRequest };
