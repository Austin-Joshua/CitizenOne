const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { getDb } = require('../src/lib/db/mongoClient');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

async function migrate() {
  console.log('Starting migration to MongoDB...');
  
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is not set in environment or .env');
    process.exit(1);
  }

  const collections = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.json') && !file.includes('example'))
    .map(file => file.replace('.json', ''));

  const db = await getDb();

  for (const name of collections) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Migrating ${name} (${data.length} records)...`);
        const col = db.collection(name);
        await col.deleteMany({});
        await col.insertMany(data.map(item => ({
          ...item,
          id: String(item.id || `${name}-${Math.random()}`)
        })));
      } else {
        console.log(`Skipping ${name} (empty or not an array)`);
      }
    } catch (err) {
      console.error(`Failed to migrate ${name}:`, err.message);
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
