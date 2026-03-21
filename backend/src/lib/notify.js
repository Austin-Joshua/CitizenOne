const { readCollection, writeCollection, nextId } = require('./dataStore');

async function notifyUser(userId, payload) {
  const rows = await readCollection('inAppNotifications');
  const item = {
    id: nextId('note', rows),
    userId: String(userId),
    title: String(payload.title || 'Notification'),
    body: String(payload.body || ''),
    type: String(payload.type || 'system'),
    read: false,
    refType: payload.refType != null ? String(payload.refType) : null,
    refId: payload.refId != null ? String(payload.refId) : null,
    createdAt: new Date().toISOString(),
  };
  rows.unshift(item);
  await writeCollection('inAppNotifications', rows);
  return item;
}

module.exports = { notifyUser };
