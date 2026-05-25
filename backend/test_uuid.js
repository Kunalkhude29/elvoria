require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrisma() {
    console.log("Connecting with DATABASE_URL:", process.env.DATABASE_URL);
    try {
        // We will try to create a dummy address with a fake UUID
        const dummyUuid = "00000000-0000-0000-0000-000000000000";
        
        console.log("Testing create with UUID:", dummyUuid);
        const res = await prisma.address.create({
            data: {
                userId: dummyUuid,
                firstName: "Test",
                lastName: "User",
                address: "123 Main St",
                city: "Mumbai",
                state: "Maharashtra",
                pinCode: "400001",
                phone: "1234567890",
                country: "India",
                isDefault: false
            }
        });
        console.log("SUCCESS:", res);
    } catch (e) {
        console.error("PRISMA ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testPrisma();
