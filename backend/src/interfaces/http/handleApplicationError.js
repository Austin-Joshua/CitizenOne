const { DomainError } = require('../../domain/errors/DomainError');

/**
 * Map domain / application errors to JSON responses. Returns true if handled.
 * @param {import('express').Response} res
 * @param {unknown} err
 * @param {import('express').Request} [req]
 */
function handleApplicationError(res, err, req) {
  if (err instanceof DomainError) {
    const body = { message: err.message };
    if (req?.requestId) body.requestId = req.requestId;
    res.status(err.statusCode).json(body);
    return true;
  }
  return false;
}

module.exports = { handleApplicationError };
