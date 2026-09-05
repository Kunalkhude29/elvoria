const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { validatePhone } = require('../utils/phoneValidation');
const { validatePincode } = require('../utils/pincodeValidation');
const { notifyNewOrder } = require('../services/notificationService');

// Initialise Razorpay with TEST MODE credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Helper: build order items in a Prisma transaction ────────────────────────
async function createOrderInTransaction(tx, { userId, customerName, customerPhone, customerEmail, shippingAddress, shippingCity, shippingState, shippingZip, orderItems, totalPrice, paymentMethod, paymentStatus, razorpayPaymentId }) {
    // 1. Verify stock and decrement
    for (const item of orderItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found.`);
        if (product.stock < item.quantity) throw new Error(`Only ${product.stock} items left in stock for ${product.name}`);

        await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
        });
    }

    // 2. Create the order
    return tx.order.create({
        data: {
            userId: userId || null,
            customerName: customerName || null,
            customerPhone: customerPhone || null,
            customerEmail: customerEmail || null,
            shippingAddress: shippingAddress || null,
            shippingCity: shippingCity || null,
            shippingState: shippingState || null,
            shippingZip: shippingZip || null,
            total: totalPrice,
            status: 'PENDING',
            paymentMethod: paymentMethod || null,
            paymentStatus: paymentStatus || null,
            razorpayPaymentId: razorpayPaymentId || null,
            items: {
                create: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
        include: { items: true },
    });
}

// ─── Shared validation helper ──────────────────────────────────────────────────
async function validateOrderInput(body) {
    const { customerPhone, shippingZip } = body;

    let validPhone = customerPhone || null;
    if (customerPhone) {
        const phoneValidation = validatePhone(customerPhone, 'IN');
        if (!phoneValidation.isValid) throw { status: 400, message: phoneValidation.error || 'Invalid phone number' };
        validPhone = phoneValidation.formatted;
    }

    if (shippingZip) {
        const pinValidation = await validatePincode(shippingZip);
        if (!pinValidation.isValid) throw { status: 400, message: pinValidation.error || 'Invalid PIN code' };
    }

    return validPhone;
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create Razorpay order + DB order (UPI / Online payment flow)
// @route   POST /api/payments/razorpay/create-order
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createRazorpayOrder = async (req, res) => {
    const {
        orderItems,
        totalPrice,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const validPhone = await validateOrderInput(req.body);

        // 1. Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(Number(totalPrice) * 100),
            currency: 'INR',
            receipt: `shweta_${Date.now()}`,
            notes: {
                customerName: customerName || '',
                customerEmail: customerEmail || '',
            },
        });

        // 2. Create a pending DB order (no stock deduction yet — done at verify step)
        const order = await prisma.order.create({
            data: {
                userId: req.user ? req.user.id : null,
                customerName: customerName || null,
                customerPhone: validPhone,
                customerEmail: customerEmail || null,
                shippingAddress: shippingAddress || null,
                shippingCity: shippingCity || null,
                shippingState: shippingState || null,
                shippingZip: shippingZip || null,
                total: totalPrice,
                status: 'PENDING',
                paymentMethod: 'UPI',
                paymentStatus: 'Pending',
                razorpayPaymentId: null,
                items: {
                    create: orderItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true },
        });

        // 3. Decrement stock proactively (consistent with existing createOrder behaviour)
        for (const item of orderItems) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return res.status(400).json({ message: 'Product not found.' });
            if (product.stock < item.quantity) return res.status(400).json({ message: `Only ${product.stock} items left in stock for ${product.name}` });

            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        return res.status(201).json({
            orderId: order.id,
            razorpayOrderId: razorpayOrder.id,
            razorpayKey: process.env.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    } catch (err) {
        console.error('[PAYMENT] createRazorpayOrder error:', err);
        if (err.status) return res.status(err.status).json({ message: err.message });
        
        // Handle Razorpay specific errors
        let errorMessage = err.message || 'Failed to create payment order';
        if (err.error && err.error.description) {
            errorMessage = err.error.description;
        }
        
        return res.status(500).json({ message: errorMessage });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify Razorpay payment signature and mark order as Paid
// @route   POST /api/payments/razorpay/verify
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const verifyRazorpayPayment = async (req, res) => {
    const {
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
    } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    try {
        // 1. Verify HMAC-SHA256 signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Mark order as failed
            await prisma.order.update({
                where: { id: Number(orderId) },
                data: { paymentStatus: 'Failed' },
            });
            return res.status(400).json({ message: 'Payment verification failed: invalid signature' });
        }

        // 2. Update order to Paid
        const updatedOrder = await prisma.order.update({
            where: { id: Number(orderId) },
            data: {
                paymentStatus: 'Paid',
                razorpayPaymentId: razorpay_payment_id,
            },
        });

        // Trigger notifications asynchronously
        notifyNewOrder(updatedOrder.id).catch(err => console.error("Notification error:", err));

        return res.status(200).json({ success: true, orderId: updatedOrder.id });
    } catch (err) {
        console.error('[PAYMENT] verifyRazorpayPayment error:', err);
        return res.status(500).json({ message: 'Payment verification error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Handle Razorpay payment failure and restore stock
// @route   POST /api/payments/razorpay/fail
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const failRazorpayPayment = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ message: 'Missing orderId' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) },
            include: { items: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'PAYMENT_FAILED' || order.status === 'CANCELLED') {
            return res.status(200).json({ success: true, message: 'Already marked as failed/cancelled' });
        }

        await prisma.$transaction(async (tx) => {
            // Restore stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }

            // Update order status
            await tx.order.update({
                where: { id: Number(orderId) },
                data: {
                    paymentStatus: 'Failed',
                    status: 'PAYMENT_FAILED'
                },
            });
        });

        return res.status(200).json({ success: true, message: 'Order marked as failed and stock restored.' });
    } catch (err) {
        console.error('[PAYMENT] failRazorpayPayment error:', err);
        return res.status(500).json({ message: 'Failed to process payment failure' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Place COD order — skip Razorpay entirely
// @route   POST /api/payments/cod/create-order
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createCODOrder = async (req, res) => {
    const {
        orderItems,
        totalPrice,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const validPhone = await validateOrderInput(req.body);

        const order = await prisma.$transaction(async (tx) => {
            return createOrderInTransaction(tx, {
                userId: req.user ? req.user.id : null,
                customerName,
                customerPhone: validPhone,
                customerEmail,
                shippingAddress,
                shippingCity,
                shippingState,
                shippingZip,
                orderItems,
                totalPrice,
                paymentMethod: 'COD',
                paymentStatus: 'Pending',
                razorpayPaymentId: null,
            });
        });

        // Trigger notifications asynchronously
        notifyNewOrder(order.id).catch(err => console.error("Notification error:", err));

        return res.status(201).json({ orderId: order.id, order });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        const statusCode = err.message?.includes('left in stock') || err.message?.includes('not found') ? 400 : 500;
        console.error('[PAYMENT] createCODOrder error:', err);
        return res.status(statusCode).json({ message: err.message || 'Failed to place order' });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    failRazorpayPayment,
    createCODOrder,
};
