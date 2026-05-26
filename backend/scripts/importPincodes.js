'use strict';

/**
 * importPincodes.js
 * -----------------
 * Imports the complete India PIN code dataset into PincodeMaster.
 * Merges two major sources to maximize coverage:
 *   1. avinashcelestine/Pincodes-data (19k+ unique PINs)
 *   2. kishorek/India-Codes (23k+ unique PINs)
 *
 * Safe to re-run.
 */

const { PrismaClient } = require('@prisma/client');
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const prisma = new PrismaClient();

// ─── Configuration ───────────────────────────────────────────────────────────
const BATCH_SIZE = 500;

const SOURCE_A_URL =
    'https://raw.githubusercontent.com/avinashcelestine/Pincodes-data/master/postofficeswithpins.csv';
const SOURCE_B_URL =
    'https://raw.githubusercontent.com/kishorek/India-Codes/master/csv/pincodes.csv';

// Guaranteed test PINs — always upserted regardless of data source outcome
const GUARANTEED_PINS = [
    { pincode: '400001', officeName: 'Mumbai GPO',         city: 'Mumbai',                    district: 'Mumbai',        state: 'Maharashtra' },
    { pincode: '411038', officeName: 'Pune City',          city: 'Pune',                       district: 'Pune',          state: 'Maharashtra' },
    { pincode: '423102', officeName: 'Manmad',             city: 'Manmad',                     district: 'Nashik',        state: 'Maharashtra' },
    { pincode: '431001', officeName: 'Aurangabad GPO',     city: 'Chhatrapati Sambhajinagar',  district: 'Aurangabad',    state: 'Maharashtra' },
    { pincode: '110001', officeName: 'New Delhi GPO',      city: 'New Delhi',                  district: 'Central Delhi', state: 'Delhi'       },
    { pincode: '781002', officeName: 'IBC Guwahati P.O.',  city: 'Guwahati',                   district: 'Kamrup Metropolitan', state: 'Assam' },
];

// ─── Stats ───────────────────────────────────────────────────────────────────
let stats = { processed: 0, inserted: 0, skipped: 0, errors: 0, batches: 0 };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(msg)  { console.log(`[IMPORT] ${msg}`); }
function warn(msg) { console.warn(`[IMPORT WARN] ${msg}`); }
function err(msg)  { console.error(`[IMPORT ERROR] ${msg}`); }

/** Download a URL and return its text content, follows redirects */
function downloadText(url, redirectCount = 0) {
    if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { headers: { 'User-Agent': 'elvoria-pincode-importer/1.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadText(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            res.on('error', reject);
        });
        req.on('error', reject);
        req.setTimeout(120000, () => { req.destroy(); reject(new Error('Download timeout')); });
    });
}

/** Robust CSV splitter supporting quoted fields with commas */
function splitCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

/** Parse CSV text and return records array */
function parseCsv(csvText, sourceName) {
    const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error('CSV has no data rows');

    const rawHeader = splitCsvLine(lines[0]);
    const header    = rawHeader.map(h => h.toLowerCase());
    log(`CSV columns for ${sourceName}: [${rawHeader.join(', ')}] (${lines.length - 1} rows)`);

    const find = (...candidates) => {
        for (const c of candidates) {
            const idx = header.indexOf(c.toLowerCase());
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const pincodeIdx  = find('pincode', 'pin_code', 'pin', 'postalcode', 'postal_code');
    const officeIdx   = find('officename', 'office_name', 'name', 'postoffice', 'post_office');
    const districtIdx = find('districtname', 'district_name', 'district', 'districtsname', 'districts_name', 'divisionname');
    const stateIdx    = find('statename', 'state_name', 'state', 'circlename');
    const cityIdx     = find('city', 'city_name') !== -1 ? find('city', 'city_name') : districtIdx;

    if (pincodeIdx  === -1) throw new Error(`Cannot find pincode column. Header: ${rawHeader.join(', ')}`);
    if (stateIdx    === -1) throw new Error(`Cannot find state column. Header: ${rawHeader.join(', ')}`);
    if (districtIdx === -1) throw new Error(`Cannot find district column. Header: ${rawHeader.join(', ')}`);

    const records = [];
    let malformed = 0;

    for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i]);

        const pincode  = cols[pincodeIdx] || '';
        const district = cols[districtIdx] || '';
        const state    = cols[stateIdx] || '';
        const city     = cityIdx !== -1 ? (cols[cityIdx] || district) : district;
        const office   = officeIdx !== -1 ? (cols[officeIdx] || null) : null;

        if (!pincode || !district || !state) { malformed++; stats.errors++; continue; }
        if (!/^[1-9]\d{5}$/.test(pincode))  { malformed++; stats.errors++; continue; }

        records.push({
            pincode,
            officeName: office ? office.slice(0, 255) : null,
            city:       city.slice(0, 100),
            district:   district.slice(0, 100),
            state:      state.slice(0, 100)
        });
    }

    if (malformed > 0) warn(`Parsed ${sourceName}: Skipped ${malformed} malformed/invalid rows`);
    return records;
}

/** Bulk upsert records in batches using createMany + skipDuplicates */
async function bulkInsert(records) {
    log(`Inserting ${records.length} records in batches of ${BATCH_SIZE}...`);
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        try {
            const result = await prisma.pincodeMaster.createMany({
                data: batch,
                skipDuplicates: true
            });
            stats.inserted += result.count;
            stats.skipped  += (batch.length - result.count);
            stats.batches++;

            if (stats.batches % 50 === 0) {
                log(`  ↳ Batch ${stats.batches}: ${stats.inserted.toLocaleString()} inserted, ${stats.skipped.toLocaleString()} skipped`);
            }
        } catch (e) {
            err(`Batch ${stats.batches + 1} failed: ${e.message}`);
            stats.errors += batch.length;
            stats.batches++;
        }
    }
}

/** Always ensure the guaranteed test PINs exist with correct data */
async function seedGuaranteedPins() {
    log('Upserting guaranteed test PINs...');
    for (const pin of GUARANTEED_PINS) {
        await prisma.pincodeMaster.upsert({
            where:  { pincode: pin.pincode },
            update: { officeName: pin.officeName, city: pin.city, district: pin.district, state: pin.state },
            create: { ...pin, country: 'India' }
        });
    }
    log(`✓ ${GUARANTEED_PINS.length} guaranteed test PINs upserted.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    log('=================================================');
    log('  India Pincode Import — Multi-Source Pipeline');
    log('=================================================');

    log(`Downloading Source A: ${SOURCE_A_URL}`);
    const csvAText = await downloadText(SOURCE_A_URL);
    const recordsA = parseCsv(csvAText, 'Source A (Avinash)');

    log(`Downloading Source B: ${SOURCE_B_URL}`);
    const csvBText = await downloadText(SOURCE_B_URL);
    const recordsB = parseCsv(csvBText, 'Source B (Kishorek)');

    // ─── Normalize & Deduplicate ─────────────────────────────────────────────
    log('Merging and normalizing datasets...');
    const mergedMap = new Map();
    let duplicatesMerged = 0;
    const conflicts = [];

    const mergeRecord = (newRec, sourceName) => {
        const existing = mergedMap.get(newRec.pincode);
        if (!existing) {
            mergedMap.set(newRec.pincode, { ...newRec, source: sourceName });
            return;
        }

        duplicatesMerged++;
        const merged = { ...existing };
        const fields = ['officeName', 'city', 'district', 'state'];
        
        fields.forEach(f => {
            const valExist = (existing[f] || '').trim();
            const valNew = (newRec[f] || '').trim();

            if (!valExist && valNew) {
                merged[f] = valNew;
            } else if (valExist && valNew && valExist.toLowerCase() !== valNew.toLowerCase()) {
                conflicts.push({
                    pincode: newRec.pincode,
                    field: f,
                    valA: valExist,
                    valB: valNew,
                    sourceA: existing.source,
                    sourceB: sourceName
                });
            }
        });

        mergedMap.set(newRec.pincode, merged);
    };

    // Process Source A first, then Source B
    recordsA.forEach(r => mergeRecord(r, 'Source A'));
    recordsB.forEach(r => mergeRecord(r, 'Source B'));

    const finalRecords = Array.from(mergedMap.values()).map(r => {
        // Strip temporary tracking source
        const { source, ...dbRec } = r;
        return {
            ...dbRec,
            country: 'India'
        };
    });

    log(`Merged to ${finalRecords.length.toLocaleString()} unique valid PIN codes.`);

    // ─── DB Operations ───────────────────────────────────────────────────────
    await bulkInsert(finalRecords);
    await seedGuaranteedPins();

    // ─── Generate Audit Statistics ──────────────────────────────────────────
    let missingCityOrState = 0;
    const stateDist = {};

    finalRecords.forEach(r => {
        if (!r.city || !r.state) {
            missingCityOrState++;
        }
        const stateName = (r.state || 'UNKNOWN').toUpperCase().trim();
        stateDist[stateName] = (stateDist[stateName] || 0) + 1;
    });

    // Write audit report file
    const totalInDb = await prisma.pincodeMaster.count();
    const sortedStates = Object.entries(stateDist).sort((a, b) => b[1] - a[1]);
    const topConflicts = conflicts.slice(0, 10);

    const reportContent = `# Pincode Import Audit Report

Generated on: ${new Date().toISOString()}

## Key Metrics
* **Total unique PINs in Database:** ${totalInDb.toLocaleString()}
* **Total processed records:** ${(recordsA.length + recordsB.length).toLocaleString()}
* **Total duplicates merged:** ${duplicatesMerged.toLocaleString()}
* **Missing city/state fields in final records:** ${missingCityOrState}

## State-wise PIN Distribution
${sortedStates.map(([state, count]) => `- **${state}:** ${count.toLocaleString()} PINs`).join('\n')}

## Top Conflicts Identified
${topConflicts.length === 0 ? '_No conflicts found_' : topConflicts.map(c => `- **PIN ${c.pincode}** (${c.field}): "${c.valA}" (${c.sourceA}) vs "${c.valB}" (${c.sourceB})`).join('\n')}
`;

    const reportPath = path.join(__dirname, '..', '..', 'brain', '1c080d56-a63e-4a05-88f9-8b9626ec2be0', 'import_audit_report.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    log(`✓ Import Audit Report written to ${reportPath}`);

    log('=================================================');
    log('  Import Complete successfully.');
    log(`  Total unique PINs in DB: ${totalInDb.toLocaleString()}`);
    log('=================================================');
}

main()
    .catch(e => {
        err(`Fatal: ${e.message}`);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
