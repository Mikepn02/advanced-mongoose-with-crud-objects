class AppError extends Error {
  constructor(message, statusCode,errName) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errName = errName;
    this.message = message
    Error.captureStackTrace(this);
  }
}
module.exports = AppError;