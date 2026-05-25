/**
 * migrate_to_cloudinary.js
 * ─────────────────────────────────────────────────────────────────────────
 * One-time script to replace old Supabase / local image URLs stored in the
 * database with their new Cloudinary equivalents.
 *
 * HOW TO USE
 * ──────────
 * 1. Fill in URL_MAP below. Each key is the OLD URL (or partial match) and
 *    the value is the NEW Cloudinary URL with f_auto,q_auto already in it.
 *
 *    Example:
 *      'https://kivflkxyqlosxwjnbotk.supabase.co/storage/v1/object/public/products/ring.jpg'
 *        => 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/elvoria/ring'
 *
 * 2. Run from the backend directory:
 *      node migrate_to_cloudinary.js
 *
 * 3. This script is safe to re-run — it only updates rows whose current
 *    URL matches a key in URL_MAP.
 * ─────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── CONFIGURE THIS MAP ───────────────────────────────────────────────────
// Key   = exact old URL stored in DB (or a unique substring to match)
// Value = new Cloudinary URL  (include f_auto,q_auto in the path)
const URL_MAP = {
    // ── Hero / Collection Banners ─────────────────────────────────────────
    // 'OLD_BANNER_URL_1': 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/elvoria/banner1',
    // 'OLD_BANNER_URL_2': 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/elvoria/banner2',

    // ── Product Images ────────────────────────────────────────────────────
    // 'OLD_PRODUCT_IMAGE_URL_1': 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/elvoria/product1',

    // ── Category Images ───────────────────────────────────────────────────
    // 'OLD_CATEGORY_IMAGE_URL_1': 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/elvoria/category1',
};
// ─────────────────────────────────────────────────────────────────────────

function replaceUrl(oldUrl) {
    if (!oldUrl) return oldUrl;
    for (const [oldKey, newVal] of Object.entries(URL_MAP)) {
        if (oldUrl === oldKey || oldUrl.includes(oldKey)) {
            return newVal;
        }
    }
    return oldUrl; // unchanged
}

async function migrateBanners() {
    console.log('\n── Migrating CollectionBanner images ──');
    const banners = await prisma.collectionBanner.findMany();
    let updated = 0;

    for (const banner of banners) {
        const newImage = replaceUrl(banner.image);
        if (newImage !== banner.image) {
            await prisma.collectionBanner.update({
                where: { id: banner.id },
                data: { image: newImage },
            });
            console.log(`  ✓ Banner #${banner.id}: ${banner.image} → ${newImage}`);
            updated++;
        }
    }
    console.log(`  Total updated: ${updated} / ${banners.length}`);
}

async function migrateProducts() {
    console.log('\n── Migrating Product images ──');
    const products = await prisma.product.findMany();
    let updated = 0;

    for (const product of products) {
        const images = Array.isArray(product.images) ? product.images : [];
        const newImages = images.map(replaceUrl);

        const changed = newImages.some((img, i) => img !== images[i]);
        if (changed) {
            await prisma.product.update({
                where: { id: product.id },
                data: { images: newImages },
            });
            console.log(`  ✓ Product #${product.id} "${product.name}": updated ${newImages.length} image(s)`);
            updated++;
        }
    }
    console.log(`  Total updated: ${updated} / ${products.length}`);
}

async function migrateCategories() {
    console.log('\n── Migrating Category images ──');
    const categories = await prisma.category.findMany();
    let updated = 0;

    for (const cat of categories) {
        const newImage = replaceUrl(cat.image);
        if (newImage !== cat.image) {
            await prisma.category.update({
                where: { id: cat.id },
                data: { image: newImage },
            });
            console.log(`  ✓ Category #${cat.id} "${cat.name}": ${cat.image} → ${newImage}`);
            updated++;
        }
    }
    console.log(`  Total updated: ${updated} / ${categories.length}`);
}

async function migrateCollectionHeroImages() {
    console.log('\n── Migrating Collection heroImages ──');
    const collections = await prisma.collection.findMany();
    let updated = 0;

    for (const col of collections) {
        const newImage = replaceUrl(col.heroImage);
        if (col.heroImage && newImage !== col.heroImage) {
            await prisma.collection.update({
                where: { id: col.id },
                data: { heroImage: newImage },
            });
            console.log(`  ✓ Collection #${col.id} "${col.name}": ${col.heroImage} → ${newImage}`);
            updated++;
        }
    }
    console.log(`  Total updated: ${updated} / ${collections.length}`);
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Elvoria → Cloudinary Image Migration');
    console.log('═══════════════════════════════════════════════════════');

    if (Object.keys(URL_MAP).length === 0) {
        console.warn('\n⚠  URL_MAP is empty. Please add your URL mappings before running.\n');
        process.exit(0);
    }

    try {
        await migrateBanners();
        await migrateProducts();
        await migrateCategories();
        await migrateCollectionHeroImages();
        console.log('\n✅  Migration complete!\n');
    } catch (err) {
        console.error('\n❌  Migration failed:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
