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
    
    // Add Shiprocket columns to Order table
    await client.query(`
      ALTER TABLE "Order" 
      ADD COLUMN IF NOT EXISTS "shiprocketOrderId" INTEGER,
      ADD COLUMN IF NOT EXISTS "shiprocketShipmentId" INTEGER,
      ADD COLUMN IF NOT EXISTS "awbCode" TEXT,
      ADD COLUMN IF NOT EXISTS "courierName" TEXT,
      ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "shipmentStatus" TEXT,
      ADD COLUMN IF NOT EXISTS "shipmentCreatedAt" TIMESTAMP(3);
    `);
    
    console.log('Shiprocket columns added to "Order" table successfully!');
  } catch (error) {
    console.error('Error executing query', error);
  } finally {
    await client.end();
  }
}

run();
