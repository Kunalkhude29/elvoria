const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DIRECT_URL.split('?')[0],
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'profiles\' AND column_name = \'phone\';');
    console.log('Query result:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
