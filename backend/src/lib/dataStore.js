const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollection(name) {
  try {
    const raw = fs.readFileSync(filePath(name), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection(name, rows) {
  fs.writeFileSync(filePath(name), JSON.stringify(rows, null, 2), 'utf8');
}

function nextId(prefix, rows) {
  return `${prefix}-${rows.length + 1}-${Date.now()}`;
}

module.exports = {
  readCollection,
  writeCollection,
  nextId,
};
