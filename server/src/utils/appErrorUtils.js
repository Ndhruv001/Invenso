// utils/AppError.js

class AppError extends Error {
  constructor(message, statusCode, errorCode = "GENERIC_ERROR", details = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;         // HTTP status (e.g., 400, 404, 500)
    this.errorCode = errorCode;           // Custom code (e.g., VALIDATION_ERROR)
    this.details = details;               // Extra info (e.g., validation errors array)
    this.isOperational = isOperational;   // True = expected error (user/db), False = bug
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace (only works in V8 engines like Node)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
export {AppError}
