'use strict';

/**
 * PincodeService
 * --------------
 * Single source of truth for all PIN code validation logic.
 * - 24-hour in-memory cache (no external HTTP calls ever)
 * - Direct Prisma DB lookup against PincodeMaster table
 * - Used by: pincodeController, pincodeValidation util, paymentController
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Cache Configuration ────────────────────────────────────────────────────
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map(); // key: pincode string, value: { result, expiresAt }

// ─── Format validation: 6-digit Indian PIN, cannot start with 0 ─────────────
function isValidFormat(pincode) {
    return /^[1-9]\d{5}$/.test(String(pincode).trim());
}

// ─── Core lookup function ────────────────────────────────────────────────────
/**
 * lookup(pincode)
 * @param {string} pincode
 * @returns {Promise<{ isValid: boolean, isVerified: boolean, city?: string, district?: string, state?: string, error?: string }>}
 */
async function lookup(pincode) {
    const pin = String(pincode || '').trim();

    // 1. Format validation
    if (!isValidFormat(pin)) {
        console.log(`[PINCODE INVALID] "${pin}" — failed format check`);
        return {
            isValid: false,
            isVerified: false,
            error: 'Invalid PIN code format. Must be a 6-digit number not starting with 0.'
        };
    }

    // 2. Cache check
    const cached = cache.get(pin);
    if (cached && Date.now() < cached.expiresAt) {
        console.log(`[PINCODE CACHE HIT] ${pin}`);
        return cached.result;
    }
    console.log(`[PINCODE CACHE MISS] ${pin}`);

    // 3. DB lookup
    try {
        const record = await prisma.pincodeMaster.findUnique({
            where: { pincode: pin }
        });

        let result;

        if (record) {
            console.log(`[PINCODE DB HIT] ${pin} → ${record.city}, ${record.state}`);
            console.log(`[PINCODE VALID] ${pin}`);
            result = {
                isValid: true,
                isVerified: true,
                city: record.city,
                district: record.district,
                state: record.state
            };
        } else {
            console.log(`[PINCODE DB MISS] ${pin} — not found in PincodeMaster`);
            console.log(`[PINCODE INVALID] ${pin} — does not exist in database`);
            result = {
                isValid: false,
                isVerified: true, // We did verify — it just doesn't exist
                error: 'This PIN code does not exist in our database. Please check and try again.'
            };
        }

        // 4. Store in cache
        cache.set(pin, { result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;

    } catch (err) {
        console.error(`[PINCODE ERROR] DB lookup failed for ${pin}:`, err.message);
        // Do NOT cache DB errors
        return {
            isValid: false,
            isVerified: false,
            error: 'PIN code lookup temporarily unavailable. Please try again.'
        };
    }
}

// ─── Thin validation wrapper for order/payment flows ────────────────────────
/**
 * validateForOrder(pincode)
 * Used by paymentController and orderController to validate shipping PINs.
 * Returns only { isValid, error } — no city/state needed in that context.
 * @param {string} pincode
 * @returns {Promise<{ isValid: boolean, error?: string }>}
 */
async function validateForOrder(pincode) {
    const { isValid, error } = await lookup(pincode);
    return { isValid, error };
}

// ─── Cache management ────────────────────────────────────────────────────────
function getCacheStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    for (const [, v] of cache) {
        if (now < v.expiresAt) active++;
        else expired++;
    }
    return { total: cache.size, active, expired };
}

function clearCache() {
    cache.clear();
    console.log('[PINCODE CACHE] Cache cleared');
}

module.exports = {
    lookup,
    validateForOrder,
    isValidFormat,
    getCacheStats,
    clearCache
};
