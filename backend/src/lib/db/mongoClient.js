const { MongoClient } = require('mongodb');

let client;
let dbPromise;

function getMongoUri() {
  return process.env.MONGO_URI ? String(process.env.MONGO_URI).trim() : null;
}

function isMongoEnabled() {
  return Boolean(getMongoUri());
}

async function getMongoClient() {
  if (client) return client;
  const uri = getMongoUri();
  if (!uri) throw new Error('MONGO_URI is not set');
  
  client = new MongoClient(uri, {
    maxPoolSize: 100,      // Handle 100 simultaneous connections
    minPoolSize: 10,       // Maintain 10 idle connections for faster response times
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000, // 45s socket timeout
    connectTimeoutMS: 30000 // 30s connection timeout
  });
  dbPromise = client.connect();
  await dbPromise;
  return client;
}

async function getDb() {
  await getMongoClient();
  return client.db(); // Uses the default DB from the connection string
}

async function mongoHealthCheck() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch (err) {
    console.error('MongoDB health check failed:', err.message);
    return false;
  }
}

module.exports = {
  isMongoEnabled,
  getMongoClient,
  getDb,
  mongoHealthCheck
};
