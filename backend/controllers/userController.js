const prisma = require('../lib/prisma');
const { validatePhone } = require('../utils/phoneValidation');
const { validatePincode } = require('../utils/pincodeValidation');

const profileSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    receivesOffers: true,
    addresses: {
        take: 1,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    },
};

const normalizeValue = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};

const getAddresses = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        console.log("Fetching addresses for user:", req.user.id, "Type:", typeof req.user.id);
        const addresses = await prisma.address.findMany({
            where: { userId: String(req.user.id) }
        });
        res.json(addresses);
    } catch (error) {
        console.error('ADDRESS FETCH ERROR:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const addAddress = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const { firstName, lastName, address, apartment, city, state, pinCode, phone, country, isDefault } = req.body;
        console.log("Saving address for user:", req.user.id, "Type:", typeof req.user.id);

        if (phone) {
            const phoneValidation = validatePhone(phone, 'IN');
            if (!phoneValidation.isValid) {
                return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
            }
        }

        if (pinCode) {
            const pinValidation = await validatePincode(pinCode);
            if (!pinValidation.isValid) {
                return res.status(400).json({ message: pinValidation.error || 'Invalid PIN code' });
            }
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: String(req.user.id) },
                data: { isDefault: false }
            });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: String(req.user.id),
                firstName,
                lastName,
                address,
                apartment,
                city,
                state,
                pinCode,
                phone,
                country: country || 'India',
                isDefault: isDefault || false
            }
        });

        // If it's the first address, make it default automatically
        const allAddresses = await prisma.address.count({ where: { userId: String(req.user.id) } });
        if (allAddresses === 1 && !isDefault) {
            await prisma.address.update({
                where: { id: newAddress.id },
                data: { isDefault: true }
            });
            newAddress.isDefault = true;
        }

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('ADDRESS SAVE ERROR:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateAddress = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const { id } = req.params;
        const { firstName, lastName, address, apartment, city, state, pinCode, phone, country, isDefault } = req.body;
        console.log("Updating address for user:", req.user.id, "Type:", typeof req.user.id);

        if (phone) {
            const phoneValidation = validatePhone(phone, 'IN');
            if (!phoneValidation.isValid) {
                return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
            }
        }

        if (pinCode) {
            const pinValidation = await validatePincode(pinCode);
            if (!pinValidation.isValid) {
                return res.status(400).json({ message: pinValidation.error || 'Invalid PIN code' });
            }
        }

        // Verify the address belongs to user
        const existingAddress = await prisma.address.findFirst({
            where: { id: parseInt(id), userId: String(req.user.id) }
        });

        if (!existingAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: String(req.user.id) },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: parseInt(id) },
            data: {
                firstName, lastName, address, apartment, city, state, pinCode, phone, country, isDefault
            }
        });

        res.json(updatedAddress);
    } catch (error) {
        console.error('ADDRESS UPDATE ERROR:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteAddress = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const { id } = req.params;
        console.log("Deleting address for user:", req.user.id, "Type:", typeof req.user.id);

        const existingAddress = await prisma.address.findFirst({
            where: { id: parseInt(id), userId: String(req.user.id) }
        });

        if (!existingAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        await prisma.address.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Address removed' });
    } catch (error) {
        console.error('ADDRESS DELETE ERROR:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, receivesOffers } = req.body;

        let formattedPhone = normalizeValue(phone);
        if (formattedPhone) {
            const phoneValidation = validatePhone(formattedPhone, 'IN');
            if (!phoneValidation.isValid) {
                return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
            }
            formattedPhone = phoneValidation.formatted;
        }

        const updatedProfile = await prisma.profile.update({
            where: { id: req.user.id },
            data: {
                firstName: normalizeValue(firstName),
                lastName: normalizeValue(lastName),
                phone: formattedPhone,
                receivesOffers: receivesOffers !== undefined ? receivesOffers : false,
            },
            select: profileSelect,
        });

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const upsertCheckoutProfile = async (req, res) => {
    try {
        const {
            email,
            firstName,
            lastName,
            phone,
            receivesOffers,
            address,
            apartment,
            city,
            state,
            pinCode,
            country,
        } = req.body;

        const normalizedEmail = normalizeValue(email);
        const normalizedFirstName = normalizeValue(firstName);
        const normalizedLastName = normalizeValue(lastName);
        const normalizedPhone = normalizeValue(phone);
        const normalizedAddress = normalizeValue(address);
        const normalizedApartment = normalizeValue(apartment);
        const normalizedCity = normalizeValue(city);
        const normalizedState = normalizeValue(state);
        const normalizedPinCode = normalizeValue(pinCode);
        const normalizedCountry = normalizeValue(country) || 'India';

        if (!normalizedPhone || !normalizedAddress || !normalizedCity || !normalizedState || !normalizedPinCode) {
            return res.status(400).json({ message: 'Please provide phone and complete delivery details.' });
        }

        const phoneValidation = validatePhone(normalizedPhone, 'IN');
        if (!phoneValidation.isValid) {
            return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
        }

        const pinValidation = await validatePincode(normalizedPinCode);
        if (!pinValidation.isValid) {
            return res.status(400).json({ message: pinValidation.error || 'Invalid PIN code' });
        }

        const profilePayload = {
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            phone: phoneValidation.formatted,
        };

        if (normalizedEmail) {
            profilePayload.email = normalizedEmail;
        }

        if (receivesOffers !== undefined) {
            profilePayload.receivesOffers = receivesOffers;
        }

        await prisma.profile.update({
            where: { id: req.user.id },
            data: profilePayload,
        });

        const existingAddress = await prisma.address.findFirst({
            where: { userId: req.user.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });

        await prisma.address.updateMany({
            where: { userId: req.user.id },
            data: { isDefault: false },
        });

        const addressPayload = {
            firstName: normalizedFirstName || '',
            lastName: normalizedLastName || '',
            address: normalizedAddress,
            apartment: normalizedApartment,
            city: normalizedCity,
            state: normalizedState,
            pinCode: normalizedPinCode,
            phone: phoneValidation.formatted,
            country: normalizedCountry,
            isDefault: true,
        };

        if (existingAddress) {
            await prisma.address.update({
                where: { id: existingAddress.id },
                data: addressPayload,
            });
        } else {
            await prisma.address.create({
                data: {
                    userId: req.user.id,
                    ...addressPayload,
                },
            });
        }

        const updatedProfile = await prisma.profile.findUnique({
            where: { id: req.user.id },
            select: profileSelect,
        });

        return res.json(updatedProfile);
    } catch (error) {
        console.error('[USER] Checkout Profile Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        console.log(`[USER] Fetching profile for ${req.user.id}`);
        const profile = await prisma.profile.findUnique({
            where: { id: req.user.id },
            select: profileSelect,
        });

        if (!profile) {
            console.log(`[USER] Profile not found for ${req.user.id}`);
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('[USER] Get Profile Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    updateProfile,
    upsertCheckoutProfile,
    getProfile,
};
