const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- PRODUCT SEEDING STARTED ---');

    // 1. Create/Update Categories
    const categories = [
        { name: 'Rings', image: 'https://images.unsplash.com/photo-1589674781757-074930d31d34?q=80&w=800' },
        { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800' },
        { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800' },
        { name: 'Earrings', image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800' }
    ];

    console.log('Seeding categories...');
    const catMap = {};
    for (const cat of categories) {
        const createdCat = await prisma.category.upsert({
            where: { name: cat.name },
            update: { image: cat.image },
            create: { name: cat.name, image: cat.image }
        });
        catMap[cat.name] = createdCat.id;
    }

    // 2. Create Sample Products
    const products = [
        {
            name: 'Classic Solitaire Diamond Ring',
            description: 'A timeless 1.5 carat round brilliant diamond set in pure 18k white gold. The perfect expression of eternal love.',
            price: 4950.00,
            stock: 10,
            categoryId: catMap['Rings'],
            images: [
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800',
                'https://images.unsplash.com/photo-1589674781757-074930d31d34?q=80&w=800'
            ]
        },
        {
            name: 'Gold Link Bracelet',
            description: 'Hand-crafted 14k yellow gold links formed into a sophisticated and heavy bracelet. Featuring a secure lobster clasp.',
            price: 1250.00,
            stock: 15,
            categoryId: catMap['Bracelets'],
            images: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800'
            ]
        },
        {
            name: 'Sapphire & Diamond Necklace',
            description: 'A deep blue oval sapphire surrounded by a halo of micro-pave diamonds on a 16-inch platinum chain.',
            price: 3200.00,
            stock: 5,
            categoryId: catMap['Necklaces'],
            images: [
                'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800'
            ]
        },
        {
            name: 'Pearl Drop Earrings',
            description: 'Lustrous South Sea pearls suspended from delicate 18k rose gold diamond-encrusted hooks.',
            price: 850.00,
            stock: 20,
            categoryId: catMap['Earrings'],
            images: [
                'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800'
            ]
        },
        {
            name: 'Vintage Emerald Band',
            description: 'Art Deco inspired band featuring channel-set Zambian emeralds and alternating round diamonds.',
            price: 2100.00,
            stock: 8,
            categoryId: catMap['Rings'],
            images: [
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800'
            ]
        }
    ];

    console.log('Seeding products...');
    for (const prod of products) {
        await prisma.product.create({
            data: prod
        });
    }

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
    .catch((e) => {
        console.error('Seeding Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
