/** Base for predictable HTTP mapping from the application layer. */
class DomainError extends Error {
  constructor(message, { code = 'DOMAIN', statusCode = 400 } = {}) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, { code: 'FORBIDDEN', statusCode: 403 });
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Not found') {
    super(message, { code: 'NOT_FOUND', statusCode: 404 });
    this.name = 'NotFoundError';
  }
}

class ConflictError extends DomainError {
  constructor(message = 'Conflict') {
    super(message, { code: 'CONFLICT', statusCode: 409 });
    this.name = 'ConflictError';
  }
}

module.exports = { DomainError, ForbiddenError, NotFoundError, ConflictError };
