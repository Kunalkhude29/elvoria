'use strict';

/**
 * pincodeValidation.js
 * --------------------
 * Thin wrapper around PincodeService for use by order/payment controllers.
 * No external HTTP calls. No network dependency.
 */

const PincodeService = require('../services/pincodeService');

/**
 * validatePincode(pincode)
 * @param {string} pincode
 * @returns {Promise<{ isValid: boolean, error?: string }>}
 */
const validatePincode = async (pincode) => {
    return PincodeService.validateForOrder(pincode);
};

module.exports = { validatePincode };
