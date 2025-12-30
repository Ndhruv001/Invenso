// Wraps async controllers to forward errors to the global error handler
export default fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

