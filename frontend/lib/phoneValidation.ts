import { parsePhoneNumber, isValidPhoneNumber, CountryCode, AsYouType } from 'libphonenumber-js';

export const validatePhone = (phone: string, country: CountryCode = 'IN'): { isValid: boolean; error?: string; formatted?: string } => {
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

        // Generic fake number detection (repeating digits or sequence)
        if (/^(\d)\1{9}$/.test(nationalNumber)) {
            return { isValid: false, error: 'Invalid phone number' }; // 0000000000, 1111111111, etc.
        }

        if (nationalNumber === '1234567890' || nationalNumber === '0987654321') {
            return { isValid: false, error: 'Invalid phone number' };
        }

        return { isValid: true, formatted: phoneNumber.formatInternational() };
    } catch (error) {
        return { isValid: false, error: 'Enter a valid mobile number' };
    }
};

export const formatPhoneAsYouType = (input: string, country: CountryCode = 'IN'): string => {
    const formatter = new AsYouType(country);
    return formatter.input(input);
};
