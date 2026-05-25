const prisma = require('./lib/prisma');

async function main() {
    console.log('Seeding curated and trending categories...');

    // Categories to remove
    const removeCats = ['Handbags', 'Jewelry', 'Watches', 'Perfumes', 'Accessories', 'Anklets'];
    try {
        await prisma.category.deleteMany({ where: { name: { in: removeCats } } });
        console.log('🗑️ Removed old/unwanted categories');
    } catch(e) { 
        console.log('ℹ️ Some categories could not be removed (likely contain products)');
    }

    const categories = [
        // Curated Section Categories
        { name: 'Wedding', image: '/images/product-3.png' },
        { name: 'Daily Wear', image: '/images/product-1.png' },
        { name: 'Gifting', image: '/images/product-2.png' },
        // Trending Section Categories
        { name: 'Rings', image: null },
        { name: 'Necklaces', image: null },
        { name: 'Bangles', image: null },
        { name: 'Earrings', image: null },
        { name: 'Mangalsutras', image: null }
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: { image: cat.image },
            create: cat
        });
        console.log(`✅ Category ensured: ${cat.name}`);
    }

    console.log('🎉 Seeding complete!');
}

main()
    .catch(async (e) => {
        console.error('❌ Error seeding categories:', e);
        process.exit(1);
    });

