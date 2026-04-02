require('dotenv').config({ path: 'c:/Users/austi/OneDrive/Desktop/CitizenOne/CitizenOne/backend/.env' });
const { mongoHealthCheck, getDb } = require('../src/lib/db/mongoClient');

async function check() {
  console.log('--- MongoDB Connection Diagnostic ---');
  console.log('URI found:', process.env.MONGO_URI ? 'Yes' : 'No');
  
  try {
    const isConnected = await mongoHealthCheck();
    if (isConnected) {
      console.log('SUCCESS: MongoDB is connected and responding to ping.');
      const db = await getDb();
      console.log('Connected to Database:', db.databaseName);
      
      const colls = await db.listCollections().toArray();
      console.log('Collections in database:', colls.map(c => c.name).join(', '));
      process.exit(0);
    } else {
      console.error('FAILURE: MongoDB health check failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('ERROR: Could not complete connection test:', err.message);
    process.exit(1);
  }
}

check();
