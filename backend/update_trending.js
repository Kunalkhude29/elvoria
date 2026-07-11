const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Ensure 'Trending' collection exists
    let trendingCollection = await prisma.collection.findUnique({ where: { name: 'Trending' } });
    if (!trendingCollection) {
        trendingCollection = await prisma.collection.create({ data: { name: 'Trending' } });
        console.log('Created Trending collection.');
    }

    // 2. Find the 'Trending' category
    const trendingCategory = await prisma.category.findUnique({ where: { name: 'Trending' } });
    if (trendingCategory) {
        // Move products to trending collection
        const products = await prisma.product.findMany({ where: { categoryId: trendingCategory.id } });
        for (const p of products) {
            await prisma.product.update({
                where: { id: p.id },
                data: {
                    categoryId: null, // Clear category so they can pick a real one like "Mangalsutras"
                    collectionId: trendingCollection.id
                }
            });
            console.log(`Updated product ${p.id} to be in Trending collection.`);
        }
        // Delete category
        await prisma.category.delete({ where: { id: trendingCategory.id } });
        console.log('Removed Trending category and migrated its products.');
    } else {
        console.log('No Trending category found to delete.');
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
