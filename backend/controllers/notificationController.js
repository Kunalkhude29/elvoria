const prisma = require('../lib/prisma');

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
const subscribe = async (req, res) => {
    try {
        const { endpoint, keys, userAgent } = req.body;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({ message: 'Invalid subscription data' });
        }

        // Upsert subscription using endpoint as unique identifier
        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                profileId: req.user.id,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userAgent: userAgent || null,
            },
            create: {
                profileId: req.user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                userAgent: userAgent || null,
            }
        });

        res.status(201).json({ message: 'Subscribed successfully', subscription });
    } catch (error) {
        console.error('Subscription Error:', error);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
};

// @desc    Unsubscribe from push notifications
// @route   DELETE /api/notifications/subscribe
// @access  Private
const unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ message: 'Endpoint is required' });
        }

        // Only allow deleting if it belongs to the current user
        await prisma.pushSubscription.deleteMany({
            where: { 
                endpoint,
                profileId: req.user.id
            }
        });

        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscribe Error:', error);
        res.status(500).json({ message: 'Failed to unsubscribe' });
    }
};

module.exports = {
    subscribe,
    unsubscribe
};
