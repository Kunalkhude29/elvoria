require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/['"]/g, '');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Seeding categories...");
        const cats = await prisma.category.findMany();
        if (cats.length === 0) {
            await prisma.category.createMany({
                data: [
                    { name: 'Rings' },
                    { name: 'Necklaces' },
                    { name: 'Earrings' },
                    { name: 'Bracelets' },
                    { name: 'Anklets' },
                    { name: 'Watches' }
                ]
            });
            console.log("Categories seeded!");
        } else {
            console.log("Categories already exist:", cats.length);
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
