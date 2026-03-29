/**
 * @param {Record<string, unknown>} tree
 * @param {string} key dot.path
 * @returns {string | undefined}
 */
export function resolveMessage(tree, key) {
  const parts = key.split('.').filter(Boolean);
  let cur = tree;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * Deep-merge locale overlay onto English base (missing strings fall back in t()).
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} overlay
 */
export function deepMergeLocale(base, overlay) {
  if (!overlay || typeof overlay !== 'object') return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(overlay)) {
    const bv = base[k];
    const ov = overlay[k];
    if (ov != null && typeof ov === 'object' && !Array.isArray(ov) && bv != null && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = deepMergeLocale(bv, ov);
    } else {
      out[k] = ov;
    }
  }
  return out;
}
