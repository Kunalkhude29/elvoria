/**
 * migrateImagesToCloudinary.js
 *
 * Reads all Product.images from the database, identifies any localhost or
 * /uploads/ URLs, uploads the corresponding files from backend/uploads/ to
 * Cloudinary, then updates each Product record with the returned Cloudinary URLs.
 * Preserves image order. Safe to re-run (skips already-migrated URLs).
 *
 * Usage:
 *   node scripts/migrateImagesToCloudinary.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const fs = require('fs');
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

/** Extract just the filename from a localhost URL or /uploads/ path */
function extractFilename(url) {
    // Handles:
    //   http://localhost:5001/uploads/image-xyz.jpg
    //   /uploads/image-xyz.jpg
    const match = url.match(/\/uploads\/([^?#]+)$/);
    return match ? match[1] : null;
}

/** Returns true if the URL needs migration */
function isLocalUrl(url) {
    return typeof url === 'string' &&
        (url.includes('localhost') || url.startsWith('/uploads/'));
}

/** Upload a local file to Cloudinary and return the secure_url */
async function uploadFileToCloudinary(filePath, publicId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                folder: 'elvoria/products',
                public_id: publicId,
                overwrite: false,      // do not re-upload if already exists
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
    });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Elvoria — Migrate Product Images to Cloudinary');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Validate env vars
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌  Cloudinary credentials not found in .env');
        process.exit(1);
    }
    console.log(`✅  Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);

    const products = await prisma.product.findMany({
        select: { id: true, name: true, images: true },
    });
    console.log(`📦  Found ${products.length} product(s) in database\n`);

    let totalMigrated = 0;
    let totalSkipped  = 0;
    let totalFailed   = 0;
    let totalAlready  = 0;

    for (const product of products) {
        const images = Array.isArray(product.images) ? product.images : [];
        if (images.length === 0) {
            console.log(`  [#${product.id}] "${product.name}" — no images, skipping`);
            continue;
        }

        console.log(`\n  ── Product #${product.id}: "${product.name}" ──`);
        const newImages = [];
        let productChanged = false;

        for (const url of images) {
            if (!isLocalUrl(url)) {
                // Already a Cloudinary URL or other hosted URL — keep as-is
                newImages.push(url);
                totalAlready++;
                console.log(`    ✓ Already hosted: ${url}`);
                continue;
            }

            const filename = extractFilename(url);
            if (!filename) {
                console.warn(`    ⚠  Cannot extract filename from: ${url} — keeping as-is`);
                newImages.push(url);
                totalSkipped++;
                continue;
            }

            const localPath = path.join(UPLOADS_DIR, filename);
            if (!fs.existsSync(localPath)) {
                console.warn(`    ⚠  File not found on disk: ${localPath} — keeping old URL`);
                newImages.push(url);
                totalSkipped++;
                continue;
            }

            // Use filename without extension as Cloudinary public_id
            const publicId = path.basename(filename, path.extname(filename));

            try {
                process.stdout.write(`    ↑  Uploading ${filename} … `);
                const cloudinaryUrl = await uploadFileToCloudinary(localPath, publicId);
                console.log(`done → ${cloudinaryUrl}`);
                newImages.push(cloudinaryUrl);
                totalMigrated++;
                productChanged = true;
            } catch (err) {
                console.error(`FAILED: ${err.message}`);
                newImages.push(url); // keep old URL on failure
                totalFailed++;
            }
        }

        if (productChanged) {
            await prisma.product.update({
                where: { id: product.id },
                data:  { images: newImages },
            });
            console.log(`    💾  DB updated for product #${product.id}`);
        } else {
            console.log(`    ℹ️   No changes needed for product #${product.id}`);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  Migration Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  ✅  Migrated to Cloudinary : ${totalMigrated}`);
    console.log(`  ☁️   Already on Cloudinary  : ${totalAlready}`);
    console.log(`  ⚠️   Skipped (file missing) : ${totalSkipped}`);
    console.log(`  ❌  Failed uploads         : ${totalFailed}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (totalFailed > 0) {
        console.warn('Some uploads failed. Re-run the script to retry failed items.');
    } else {
        console.log('🎉  All images migrated successfully!');
    }
}

main()
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
