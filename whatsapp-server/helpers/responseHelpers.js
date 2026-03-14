const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    }
  });
};

const errorResponse = (res, code, message, stack = null, fields = null, statusCode = 500) => {
  const errorObj = {
    success: false,
    message,
    error: {
      code,
      details: message,
      fields
    },
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    }
  };

  if (process.env.NODE_ENV === "development" && stack) {
    errorObj.error.stack = stack;
  }

  return res.status(statusCode).json(errorObj);
};

export default { successResponse, errorResponse };
export { successResponse, errorResponse };
