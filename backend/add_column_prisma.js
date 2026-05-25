const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Attempting to add column via Prisma...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "profiles" 
      ADD COLUMN IF NOT EXISTS "phone" TEXT;
    `);
    console.log('Column "phone" added successfully (or already existed)');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
