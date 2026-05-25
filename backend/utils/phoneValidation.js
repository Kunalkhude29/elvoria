const { parsePhoneNumber, AsYouType } = require('libphonenumber-js');

const validatePhone = (phone, country = 'IN') => {
    try {
        if (!phone || phone.trim() === '') {
            return { isValid: false, error: 'Phone number is required' };
        }

        const phoneNumber = parsePhoneNumber(phone, country);

        if (!phoneNumber.isValid()) {
            return { isValid: false, error: 'Invalid phone number format' };
        }

        const nationalNumber = phoneNumber.nationalNumber;

        // India-specific rules
        if (country === 'IN') {
            if (nationalNumber.length !== 10) {
                return { isValid: false, error: 'Enter a valid 10-digit mobile number' };
            }

            const firstDigit = nationalNumber.charAt(0);
            if (!['6', '7', '8', '9'].includes(firstDigit)) {
                return { isValid: false, error: 'Indian mobile numbers must start with 6, 7, 8, or 9' };
            }
        }

        // Generic fake number detection
        if (/^(\d)\1{9}$/.test(nationalNumber)) {
            return { isValid: false, error: 'Invalid phone number' };
        }

        if (nationalNumber === '1234567890' || nationalNumber === '0987654321') {
            return { isValid: false, error: 'Invalid phone number' };
        }

        return { isValid: true, formatted: phoneNumber.formatInternational() };
    } catch (error) {
        return { isValid: false, error: 'Enter a valid mobile number' };
    }
};

module.exports = {
    validatePhone
};
