const SERVICE_CATEGORY_KEYS = {
  general: 'serviceDesk.catGeneral',
  benefits: 'serviceDesk.catBenefits',
  documents: 'serviceDesk.catDocuments',
  technical: 'serviceDesk.catTechnical',
};

/** @param {string | undefined} raw */
export function labelServiceRequestCategory(raw, t) {
  const c = String(raw || '').trim().toLowerCase();
  const key = SERVICE_CATEGORY_KEYS[c];
  return key ? t(key) : raw || '';
}

/** @param {string | undefined} raw */
export function labelServiceRequestStatus(raw, t) {
  return labelBackendEnum(t, 'serviceDesk.reqStatus', raw);
}

/** @param {string | undefined} raw */
export function labelApplicationStatus(raw, t) {
  return labelBackendEnum(t, 'serviceDesk.appStatus', raw);
}

/**
 * @param {string | undefined} raw application `type` from API (freeform)
 */
export function labelApplicationType(raw, t) {
  return labelBackendEnum(t, 'serviceDesk.appType', raw);
}

function labelBackendEnum(t, baseKey, raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  const key = `${baseKey}.${v}`;
  const out = t(key);
  if (out === key) return humanizeSnake(v);
  return out;
}

function humanizeSnake(v) {
  return v
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
