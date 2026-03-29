/**
 * Inserts billingPage + profilePage before "common" in locale JSON files.
 * Run from repo root: node frontend/scripts/merge-billing-profile-locales.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');
const fragmentsDir = path.join(__dirname, 'locale-fragments');

for (const lang of ['hi', 'ta', 'te', 'ml', 'kn']) {
  const fragPath = path.join(fragmentsDir, `${lang}.json`);
  const extra = JSON.parse(fs.readFileSync(fragPath, 'utf8'));
  if (!extra?.billingPage || !extra?.profilePage) {
    throw new Error(`Missing billingPage/profilePage in ${fragPath}`);
  }
  const p = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = {};
  for (const k of Object.keys(data)) {
    if (k === 'billingPage' || k === 'profilePage') continue;
    if (k === 'common') {
      next.billingPage = extra.billingPage;
      next.profilePage = extra.profilePage;
    }
    next[k] = data[k];
  }
  fs.writeFileSync(p, `${JSON.stringify(next, null, 2)}\n`);
}

console.log('Merged billingPage + profilePage into hi, ta, te, ml, kn.');
