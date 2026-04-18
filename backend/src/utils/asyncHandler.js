// Wrapper to avoid try/catch in every controller
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom API error class
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { asyncHandler, ApiError };
