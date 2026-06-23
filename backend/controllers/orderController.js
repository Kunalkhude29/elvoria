const prisma = require('../lib/prisma');
const { validatePhone } = require('../utils/phoneValidation');
const { validatePincode } = require('../utils/pincodeValidation');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Public via Checkout
const createOrder = async (req, res) => {
    const {
        orderItems,
        totalPrice,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    let validPhone = customerPhone || null;
    if (customerPhone) {
        const phoneValidation = validatePhone(customerPhone, 'IN');
        if (!phoneValidation.isValid) {
            return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
        }
        validPhone = phoneValidation.formatted;
    }

    if (shippingZip) {
        const pinValidation = await validatePincode(shippingZip);
        if (!pinValidation.isValid) {
            return res.status(400).json({ message: pinValidation.error || 'Invalid PIN code' });
        }
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            // 1. Verify and deduct stock for each item
            for (const item of orderItems) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new Error(`Product not found.`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Only ${product.stock} items left in stock for ${product.name}`);
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            // 2. Create the order
            return await tx.order.create({
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
                    items: {
                        create: orderItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: { items: true }
            });
        });

        res.status(201).json(order);
    } catch (error) {
        // Return 400 for our custom stock/product errors, 500 for generic DB errors
        const statusCode = error.message.includes('left in stock') || error.message.includes('not found') ? 400 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { id: true } },
                items: {
                    include: {
                        product: { select: { name: true, images: true, id: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID (Admin)
// @route   GET /api/orders/:id
// @access  Private/Admin
const getOrderById = async (req, res) => {
    const orderId = Number(req.params.id);
    console.log('GET /api/orders/:id called with ID:', req.params.id, 'parsed as:', orderId);
    
    if (isNaN(orderId)) {
        console.error('Invalid order ID provided:', req.params.id);
        return res.status(400).json({ message: 'Invalid order ID' });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                items: {
                    include: {
                        product: { select: { name: true, images: true, id: true, price: true } }
                    }
                },
                requests: true
            }
        });

        if (!order) {
            console.log('Order not found in DB for ID:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order found, returning data for ID:', orderId);
        res.json(order);
    } catch (error) {
        console.error('Database error in getOrderById:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = Number(req.params.id);

    // Validate status
    const validStatuses = [
        'PENDING', 
        'PROCESSING', 
        'SHIPPED', 
        'OUT_FOR_DELIVERY', 
        'DELIVERED', 
        'RETURN_INITIATED', 
        'RETURN_COLLECTED', 
        'REFUND_PROCESSING', 
        'REFUND_COMPLETED', 
        'PAYMENT_FAILED', 
        'CANCELLED'
    ];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Fetch current order to check previous status and get item quantities
        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!currentOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Prepare update data payload
        const updateData = { status };
        if (status === 'DELIVERED') {
            updateData.deliveredAt = new Date();
        }

        const wasActive = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_INITIATED', 'RETURN_COLLECTED', 'REFUND_PROCESSING', 'REFUND_COMPLETED'].includes(currentOrder.status);
        const isActive = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_INITIATED', 'RETURN_COLLECTED', 'REFUND_PROCESSING', 'REFUND_COMPLETED'].includes(status);

        // If moving from Active to Failed/Cancelled, restore stock
        const isCancellation = wasActive && !isActive;

        // If moving from Failed/Cancelled back to Active, deduct stock
        const isReactivation = !wasActive && isActive;

        if (isReactivation) {
            await prisma.$transaction(async (tx) => {
                // Verify and decrement stock
                for (const item of currentOrder.items) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product) {
                        throw new Error(`Product not found.`);
                    }
                    if (product.stock < item.quantity) {
                        throw new Error(`Only ${product.stock} items left in stock for ${product.name}`);
                    }

                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: updateData
                });
                res.json(updatedOrder);
            });
        } else if (isCancellation) {
            await prisma.$transaction(async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: updateData
                });

                // Restore stock
                for (const item of currentOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
                res.json(updatedOrder);
            });
        } else {
            // Normal update without stock changes
            const order = await prisma.order.update({
                where: { id: orderId },
                data: updateData
            });
            res.json(order);
        }

    } catch (error) {
        console.error('Error updating order:', error);
        const statusCode = error.message?.includes('left in stock') || error.message?.includes('not found') ? 400 : 500;
        res.status(statusCode).json({ message: error.message || 'Error updating order status' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { 
                userId: req.user.id,
                status: { not: 'PAYMENT_FAILED' }
            },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, images: true, id: true } }
                    }
                },
                requests: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single logged in user order by ID
// @route   GET /api/orders/myorders/:id
// @access  Private
const getMyOrderById = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, images: true, id: true } }
                    }
                },
                requests: true
            }
        });

        if (!order || order.userId !== req.user.id || order.status === 'PAYMENT_FAILED') {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders, getMyOrderById };

