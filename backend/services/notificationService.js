const webpush = require('web-push');
const prisma = require('../lib/prisma');
require('dotenv').config();

// Configure web-push with VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn("VAPID keys not fully configured in environment. Push notifications will fail.");
}

/**
 * Send a notification payload to a list of subscriptions and clean up invalid ones.
 */
const sendPushToSubscriptions = async (subscriptions, payload) => {
    if (!subscriptions || subscriptions.length === 0) return;

    const payloadString = JSON.stringify(payload);
    const results = await Promise.allSettled(
        subscriptions.map(sub => 
            webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }, payloadString).catch(err => {
                // Return the error with the subscription endpoint so we know which one failed
                return Promise.reject({ error: err, endpoint: sub.endpoint });
            })
        )
    );

    // Clean up invalid/expired subscriptions
    const endpointsToDelete = [];
    results.forEach(result => {
        if (result.status === 'rejected') {
            const statusCode = result.reason?.error?.statusCode;
            if (statusCode === 404 || statusCode === 410) {
                // Subscription is no longer valid
                endpointsToDelete.push(result.reason.endpoint);
            } else {
                console.error("Failed to send push notification:", result.reason?.error);
            }
        }
    });

    if (endpointsToDelete.length > 0) {
        try {
            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: { in: endpointsToDelete }
                }
            });
            console.log(`Cleaned up ${endpointsToDelete.length} invalid push subscriptions.`);
        } catch (dbError) {
            console.error("Error cleaning up push subscriptions:", dbError);
        }
    }
};

/**
 * Safely writes to NotificationLog to prevent duplicate notifications for the same order and type.
 * Returns true if safe to proceed, false if it's a duplicate.
 */
const checkAndLogNotification = async (orderId, type) => {
    try {
        await prisma.notificationLog.create({
            data: { orderId, type }
        });
        return true;
    } catch (error) {
        // P2002 is Prisma's unique constraint violation error code
        if (error.code === 'P2002') {
            console.log(`Notification of type ${type} for order ${orderId} already sent. Skipping.`);
            return false;
        }
        console.error("Error checking notification log:", error);
        return false; // Fail safe
    }
};

/**
 * Notify the customer and admins of a new order
 */
const notifyNewOrder = async (orderId) => {
    try {
        // Fetch order details
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) return;

        // 1. Notify Customer (ORDER_CONFIRMED)
        if (order.userId) {
            const canNotifyCustomer = await checkAndLogNotification(orderId, 'ORDER_CONFIRMED');
            if (canNotifyCustomer) {
                const customerSubscriptions = await prisma.pushSubscription.findMany({
                    where: { profileId: order.userId }
                });

                if (customerSubscriptions.length > 0) {
                    await sendPushToSubscriptions(customerSubscriptions, {
                        type: 'ORDER_CONFIRMED',
                        title: 'Order Confirmed 🎉',
                        body: `Your order #ELV-${orderId} has been successfully placed.`,
                        orderId: String(orderId),
                        url: `/profile`
                    });
                }
            }
        }

        // 2. Notify Admins (NEW_ORDER)
        const canNotifyAdmin = await checkAndLogNotification(orderId, 'NEW_ORDER');
        if (canNotifyAdmin) {
            // Find all profiles with role ADMIN
            const admins = await prisma.profile.findMany({
                where: { role: 'ADMIN' },
                select: { id: true }
            });
            
            if (admins.length > 0) {
                const adminIds = admins.map(a => a.id);
                const adminSubscriptions = await prisma.pushSubscription.findMany({
                    where: { profileId: { in: adminIds } }
                });

                if (adminSubscriptions.length > 0) {
                    await sendPushToSubscriptions(adminSubscriptions, {
                        type: 'NEW_ORDER',
                        title: 'New Order Received 🛒',
                        body: `Order #ELV-${orderId} for ₹${order.total} has been placed.`,
                        orderId: String(orderId),
                        url: `/admin/orders/${orderId}`
                    });
                }
            }
        }

    } catch (error) {
        console.error('Error in notifyNewOrder:', error);
    }
};

module.exports = {
    notifyNewOrder
};
