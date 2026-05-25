const validatePincode = async (pincode) => {
    if (!/^\d{6}$/.test(pincode)) {
        return { isValid: false, error: 'PIN code must be exactly 6 digits' };
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            return { isValid: true };
        } else {
            return { isValid: false, error: 'Invalid PIN code according to India Post' };
        }
    } catch (error) {
        console.error('Error validating PIN code:', error.message);
        return { isValid: false, error: 'Failed to validate PIN code' };
    }
};

module.exports = { validatePincode };
