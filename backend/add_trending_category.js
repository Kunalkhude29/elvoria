const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.category.findUnique({
        where: { name: 'Trending' }
    });
    
    if (!existing) {
        await prisma.category.create({
            data: { name: 'Trending' }
        });
        console.log('Trending category added successfully.');
    } else {
        console.log('Trending category already exists.');
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
