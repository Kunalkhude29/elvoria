const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial categories...');

    const categories = [
        { name: 'Handbags' },
        { name: 'Jewelry' },
        { name: 'Watches' },
        { name: 'Perfumes' },
        { name: 'Accessories' }
    ];

    for (const cat of categories) {
        // Upsert ensures we don't create duplicates if run multiple times
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat
        });
        console.log(`✅ Category ensured: ${cat.name}`);
    }

    console.log('🎉 Seeding complete! You can now select these categories in the admin panel.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error seeding categories:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
