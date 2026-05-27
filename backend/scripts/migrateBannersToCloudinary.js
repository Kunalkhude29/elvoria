/**
 * migrateBannersToCloudinary.js
 *
 * Migrates CollectionBanner.image and Collection.heroImage fields from
 * localhost/local /uploads/ paths to Cloudinary URLs.
 * Safe to re-run — skips already-migrated Cloudinary URLs.
 *
 * Usage:
 *   node scripts/migrateBannersToCloudinary.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const fs   = require('fs');
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');

// ── Configure Cloudinary ───────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// ── Helpers ────────────────────────────────────────────────────────────────

function isLocalUrl(url) {
    return typeof url === 'string' &&
        (url.includes('localhost') || url.startsWith('/uploads/'));
}

function extractFilename(url) {
    const match = url.match(/\/uploads\/([^?#]+)$/);
    return match ? match[1] : null;
}

async function uploadFileToCloudinary(filePath, publicId, folder) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                folder,
                public_id: publicId,
                overwrite: false,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
    });
}

/** Migrates a single URL: uploads file and returns new Cloudinary URL (or original on skip/fail) */
async function migrateUrl(url, folder, label) {
    if (!url || !isLocalUrl(url)) {
        if (url && url.includes('cloudinary.com')) {
            console.log(`    ✓ Already on Cloudinary: ${url}`);
        }
        return { url, changed: false, status: 'skipped' };
    }

    const filename = extractFilename(url);
    if (!filename) {
        console.warn(`    ⚠  Cannot extract filename from: ${url}`);
        return { url, changed: false, status: 'skipped' };
    }

    const localPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(localPath)) {
        console.warn(`    ⚠  File not on disk: ${localPath} — keeping old URL`);
        return { url, changed: false, status: 'missing' };
    }

    const publicId = path.basename(filename, path.extname(filename));
    try {
        process.stdout.write(`    ↑  Uploading ${filename} … `);
        const newUrl = await uploadFileToCloudinary(localPath, publicId, folder);
        console.log(`done → ${newUrl}`);
        return { url: newUrl, changed: true, status: 'migrated' };
    } catch (err) {
        console.error(`FAILED: ${err.message}`);
        return { url, changed: false, status: 'failed' };
    }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Elvoria — Migrate Banners & Collections to Cloudinary');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌  Cloudinary credentials not found in .env');
        process.exit(1);
    }
    console.log(`✅  Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

    let migrated = 0, skipped = 0, failed = 0, missing = 0;

    // ── 1. CollectionBanner.image ──────────────────────────────────────────
    console.log('── CollectionBanner.image ──────────────────────────────────');
    const banners = await prisma.collectionBanner.findMany({
        select: { id: true, collectionId: true, image: true },
    });
    console.log(`Found ${banners.length} banner(s)\n`);

    for (const banner of banners) {
        console.log(`  Banner #${banner.id} (collectionId: ${banner.collectionId})`);
        const result = await migrateUrl(banner.image, 'elvoria/banners', `Banner #${banner.id}`);
        if (result.changed) {
            await prisma.collectionBanner.update({
                where: { id: banner.id },
                data:  { image: result.url },
            });
            console.log(`    💾  DB updated for CollectionBanner #${banner.id}`);
            migrated++;
        } else {
            if (result.status === 'failed')   failed++;
            else if (result.status === 'missing') missing++;
            else skipped++;
        }
    }

    // ── 2. Collection.heroImage ────────────────────────────────────────────
    console.log('\n── Collection.heroImage ────────────────────────────────────');
    const collections = await prisma.collection.findMany({
        select: { id: true, name: true, heroImage: true },
    });
    console.log(`Found ${collections.length} collection(s)\n`);

    for (const col of collections) {
        console.log(`  Collection #${col.id} "${col.name}"`);
        if (!col.heroImage) {
            console.log(`    ⚠️   heroImage is empty — skipping`);
            skipped++;
            continue;
        }
        const result = await migrateUrl(col.heroImage, 'elvoria/collections', `Collection #${col.id}`);
        if (result.changed) {
            await prisma.collection.update({
                where: { id: col.id },
                data:  { heroImage: result.url },
            });
            console.log(`    💾  DB updated for Collection #${col.id}`);
            migrated++;
        } else {
            if (result.status === 'failed')   failed++;
            else if (result.status === 'missing') missing++;
            else skipped++;
        }
    }

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  Migration Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  ✅  Migrated to Cloudinary : ${migrated}`);
    console.log(`  ☁️   Already/no change      : ${skipped}`);
    console.log(`  ⚠️   File missing on disk   : ${missing}`);
    console.log(`  ❌  Failed uploads          : ${failed}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (failed > 0) {
        console.warn('Some uploads failed. Re-run the script to retry.');
    } else {
        console.log('🎉  All banners and collection images migrated successfully!');
    }
}

main()
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
