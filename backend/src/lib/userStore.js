const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function getUsers() {
  return readUsers();
}

function findUserById(id) {
  return readUsers().find((u) => u.id === id) || null;
}

function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return readUsers().find((u) => String(u.email).toLowerCase() === normalized) || null;
}

function createUser(user) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
  return user;
}

function updateUser(id, patch) {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...patch };
  writeUsers(users);
  return users[index];
}

module.exports = {
  getUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
};
