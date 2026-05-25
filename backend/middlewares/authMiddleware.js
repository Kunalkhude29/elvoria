const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const profileSelect = { id: true, role: true, email: true };

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await prisma.profile.findUnique({
                where: { id: decoded.id },
                select: profileSelect,
            });

            if (!req.user) {
                return res.status(401).json({ message: 'User profile not found. Please log in again.' });
            }

            req.auth = { source: 'custom', userId: decoded.id };
            return next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }


};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
