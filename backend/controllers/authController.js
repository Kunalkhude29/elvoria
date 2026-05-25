const prisma = require('../lib/prisma');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validatePhone } = require('../utils/phoneValidation');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Send OTP to email
// @route   POST /api/auth/user/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // 1. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Delete existing OTPs for this email
        await prisma.otp.deleteMany({
            where: { email }
        });

        // 3. Save new OTP with 5-minute expiry
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await prisma.otp.create({
            data: {
                email,
                otp: otpCode,
                expiresAt
            }
        });

        // 4. Send OTP via Resend
        const { data, error } = await resend.emails.send({
            from: 'SHWETA <noreply@elvoriajewels.in>',
            to: email,
            subject: 'Your SHWETA Verification Code',
            html: `
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">SHWETA</h2>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">Your verification code is:</p>
                    <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                        ${otpCode}
                    </div>
                    <p style="font-size: 14px; color: #888;">This code will expire in 5 minutes.</p>
                    <p style="font-size: 14px; color: #888;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(500).json({ message: 'Failed to send OTP email', error: error.message });
        }

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/user/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    console.log(`[AUTH] Verify OTP started for: ${email}`);

    if (!email || !otp) {
        console.log('[AUTH] Missing email or OTP');
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const { email, otp, firstName, lastName, phone, address, city, state, pinCode } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // 1. Fetch OTP record
        console.log(`[AUTH] Fetching OTP record for ${email}...`);
        const otpRecord = await prisma.otp.findUnique({
            where: { email }
        });

        // 2. Validate OTP
        if (!otpRecord) {
            console.log(`[AUTH] No OTP record found for ${email}`);
            return res.status(401).json({ message: 'No OTP requested for this email' });
        }

        console.log(`[AUTH] Validating OTP manually for ${email}...`);
        if (otpRecord.otp !== otp) {
            console.log(`[AUTH] Invalid OTP entered for ${email}`);
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // 3. Check expiry
        console.log(`[AUTH] Checking OTP expiry for ${email}...`);
        if (new Date() > otpRecord.expiresAt) {
            console.log(`[AUTH] OTP expired for ${email}`);
            await prisma.otp.delete({ where: { email } });
            return res.status(401).json({ message: 'OTP expired' });
        }

        // 4. OTP is valid, delete it
        console.log(`[AUTH] OTP valid. Deleting record for ${email}...`);
        await prisma.otp.delete({ where: { email } });

        // 5. Find or create profile
        console.log(`[AUTH] Syncing Profile for ${email}...`);
        let profile = await prisma.profile.findUnique({
            where: { email },
            include: { addresses: true }
        });

        let validPhone = phone || null;
        if (phone) {
            const phoneValidation = validatePhone(phone, 'IN');
            if (!phoneValidation.isValid) {
                return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
            }
            validPhone = phoneValidation.formatted;
        }

        if (!profile) {
            console.log(`[AUTH] Creating new Profile for ${email}...`);
            profile = await prisma.profile.create({
                data: {
                    id: uuidv4(),
                    email,
                    role: 'USER', // Default for new users
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(validPhone && { phone: validPhone }),
                },
                include: { addresses: true }
            });
        } else {
            console.log(`[AUTH] Updating existing Profile for ${email}...`);
            profile = await prisma.profile.update({
                where: { id: profile.id },
                data: {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(validPhone && { phone: validPhone }),
                },
                include: { addresses: true }
            });
        }

        // 6. Handle Address if provided
        if (address) {
            console.log(`[AUTH] Saving address for ${email}...`);
            const addressData = {
                firstName: firstName || profile.firstName || '',
                lastName: lastName || profile.lastName || '',
                address,
                city: city || '',
                state: state || '',
                pinCode: pinCode || '',
                phone: validPhone || profile.phone || '',
                country: 'India',
                isDefault: true
            };

            if (profile.addresses && profile.addresses.length > 0) {
                await prisma.address.update({
                    where: { id: profile.addresses[0].id },
                    data: addressData
                });
            } else {
                await prisma.address.create({
                    data: {
                        ...addressData,
                        profileId: profile.id
                    }
                });
            }
            // Fetch updated profile with addresses
            profile = await prisma.profile.findUnique({
                where: { id: profile.id },
                include: { addresses: true }
            });
        }

        // 7. Generate token and return success
        console.log(`[AUTH] Generating JWT for ${email}...`);
        const token = generateToken(profile.id, profile.role);

        console.log(`[AUTH] Login successful for ${email}`);
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: profile.id,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role,
                addresses: profile.addresses
            }
        });

    } catch (error) {
        console.error('[AUTH] Verify OTP Error:', error);
        return res.status(500).json({ message: 'Internal server error during verification' });
    }
};

module.exports = {
    sendOtp,
    verifyOtp
};
