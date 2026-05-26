'use strict';

const PincodeService = require('../services/pincodeService');

/**
 * GET /api/pincode/:pincode
 * Thin Express handler — delegates entirely to PincodeService.
 */
async function lookup(req, res) {
    const { pincode } = req.params;
    const result = await PincodeService.lookup(pincode);
    // Use 200 for valid, 404 for PIN not found, 400 for bad format
    if (result.isValid) {
        return res.status(200).json(result);
    }
    if (!result.isVerified) {
        // format error
        return res.status(400).json(result);
    }
    // valid format but not in DB
    return res.status(404).json(result);
}

module.exports = { lookup };
