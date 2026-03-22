const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
                    customerPhone: customerPhone || null,
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
                user: { select: { id: true, email: true } },
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

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = Number(req.params.id);

    // Validate status
    const validStatuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
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

        // Check if the order is moving into a status that requires stock deduction
        const isNewFulfillment = (status === 'SHIPPED' || status === 'DELIVERED') &&
            (currentOrder.status !== 'SHIPPED' && currentOrder.status !== 'DELIVERED');

        // Check if the order is moving backwards from fulfilled to unfulfilled
        const isCancellation = (status === 'PENDING' || status === 'CANCELLED') &&
            (currentOrder.status === 'SHIPPED' || currentOrder.status === 'DELIVERED');


        if (isNewFulfillment) {

            // Start an interactive transaction because we need to loop arrays
            await prisma.$transaction(async (tx) => {
                // Update Order Status
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status }
                });

                // Iterate over all purchased items
                for (const item of currentOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    });
                }
                res.json(updatedOrder);
            });

        } else if (isCancellation) {

            // Refund the stock items back to the parent product
            await prisma.$transaction(async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status }
                });

                for (const item of currentOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                }
                res.json(updatedOrder);
            });

        } else {
            // Normal update without stock changes
            const order = await prisma.order.update({
                where: { id: orderId },
                data: { status }
            });
            res.json(order);
        }

    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
