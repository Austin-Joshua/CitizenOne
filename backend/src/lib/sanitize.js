/** Strip angle brackets and trim length for simple XSS reduction on stored text fields. */

function stripAngle(s) {
  return String(s || '').replace(/[<>]/g, '');
}

function shortText(s, max) {
  return stripAngle(s).trim().slice(0, max);
}

function sanitizeServiceRequestPayload(body) {
  const title = shortText(body?.title, 240);
  const description = shortText(body?.description, 8000);
  const category = shortText(body?.category, 64).toLowerCase() || 'general';
  return { title, description, category };
}

function sanitizeDocumentPayload(body) {
  const name = shortText(body?.name, 200);
  const category = shortText(body?.category, 64) || 'General';
  const type = shortText(body?.type, 32) || 'PDF';
  const size = shortText(body?.size, 32) || '0KB';
  const expiresAt = body?.expiresAt != null ? shortText(body.expiresAt, 32) : null;
  return { name, category, type, size, expiresAt };
}

function sanitizeApplicationPayload(body) {
  const type = shortText(body?.type, 64);
  const targetId = shortText(body?.targetId, 128);
  const title = shortText(body?.title, 300);
  const deadline = body?.deadline != null ? shortText(body.deadline, 40) : null;
  return { type, targetId, title, deadline };
}

module.exports = {
  shortText,
  sanitizeServiceRequestPayload,
  sanitizeDocumentPayload,
  sanitizeApplicationPayload,
};
