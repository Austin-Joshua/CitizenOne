const { appendAudit, clientIp } = require('../../lib/auditLog');

/**
 * Single entry point for security-relevant audit events (SIEM export hooks go here later).
 */
class AuditService {
  static record(event) {
    return appendAudit(event);
  }

  static clientIp(req) {
    return clientIp(req);
  }
}

module.exports = { AuditService };
