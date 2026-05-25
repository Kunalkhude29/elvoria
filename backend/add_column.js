const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add phone column if it doesn't exist
    await client.query(`
      ALTER TABLE "profiles" 
      ADD COLUMN IF NOT EXISTS "phone" TEXT;
    `);
    
    console.log('Column "phone" added successfully (or already existed)');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await client.end();
  }
}

run();
