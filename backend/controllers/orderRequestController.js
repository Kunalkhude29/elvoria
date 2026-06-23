const prisma = require('../lib/prisma');

// @desc    Submit a return or cancel request
// @route   POST /api/order-requests
// @access  Private
const createOrderRequest = async (req, res) => {
    const { orderId, type, reason, bankAccountName, bankName, bankAccountNumber, bankIfscCode, upiId } = req.body;

    if (!orderId || !type || !reason) {
        return res.status(400).json({ message: 'orderId, type, and reason are required' });
    }

    const validTypes = ['RETURN', 'CANCEL'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'type must be RETURN or CANCEL' });
    }

    if (reason.trim().length < 10) {
        return res.status(400).json({ message: 'Please provide a more detailed reason (at least 10 characters)' });
    }

    try {
        // Verify the order belongs to the logged-in user
        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to request on this order' });
        }

        // Enforce logic rules
        if (type === 'RETURN') {
            if (order.status !== 'DELIVERED') {
                return res.status(400).json({ message: 'Returns can only be requested for delivered orders' });
            }
            if (order.deliveredAt) {
                const daysSinceDelivery = (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
                if (daysSinceDelivery > 7) {
                    return res.status(400).json({ message: 'Returns can only be requested within 7 days of delivery' });
                }
            }
            if (order.paymentMethod === 'COD' && (!bankAccountName || !bankName || !bankAccountNumber || !bankIfscCode)) {
                return res.status(400).json({ message: 'Bank details are required for COD returns' });
            }
        }

        // Check for existing pending request of the same type
        const existing = await prisma.orderRequest.findFirst({
            where: {
                orderId: Number(orderId),
                type,
                status: 'PENDING'
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'A pending request of this type already exists for this order' });
        }

        const request = await prisma.$transaction(async (tx) => {
            const newRequest = await tx.orderRequest.create({
                data: {
                    orderId: Number(orderId),
                    type,
                    reason: reason.trim(),
                    status: 'PENDING',
                    bankAccountName: bankAccountName || null,
                    bankName: bankName || null,
                    bankAccountNumber: bankAccountNumber || null,
                    bankIfscCode: bankIfscCode || null,
                    upiId: upiId || null
                }
            });

            if (type === 'RETURN') {
                await tx.order.update({
                    where: { id: Number(orderId) },
                    data: { status: 'RETURN_INITIATED' }
                });
            }

            return newRequest;
        });

        res.status(201).json({ message: 'Request submitted successfully', request });
    } catch (error) {
        console.error('Error creating order request:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all order requests (Admin)
// @route   GET /api/order-requests
// @access  Private/Admin
const getOrderRequests = async (req, res) => {
    try {
        const requests = await prisma.orderRequest.findMany({
            include: {
                order: {
                    select: {
                        id: true,
                        customerName: true,
                        customerEmail: true,
                        customerPhone: true,
                        total: true,
                        status: true,
                        paymentMethod: true,
                        refundStatus: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order request status (Admin)
// @route   PUT /api/order-requests/:id
// @access  Private/Admin
const updateOrderRequestStatus = async (req, res) => {
    const { status } = req.body;
    const requestId = Number(req.params.id);

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const updatedRequest = await prisma.$transaction(async (tx) => {
            // Update the request status
            const request = await tx.orderRequest.update({
                where: { id: requestId },
                data: { status },
                include: { order: { include: { items: true } } }
            });

            // If a CANCEL request is approved, process the cancellation
            if (status === 'APPROVED' && request.type === 'CANCEL') {
                const order = request.order;
                
                // Determine if a refund is required
                const requiresRefund = order.paymentMethod !== 'COD' && order.paymentStatus === 'Paid';

                // 1. Update Order Status
                await tx.order.update({
                    where: { id: order.id },
                    data: { 
                        status: 'CANCELLED',
                        cancelledBy: 'CUSTOMER',
                        cancellationReason: request.reason,
                        cancelledAt: new Date(),
                        refundStatus: requiresRefund ? 'PENDING' : 'NOT_REQUIRED'
                    }
                });

                // 2. Restore Stock
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                }
            }

            return request;
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating order request:', error);
        res.status(500).json({ message: 'Error updating request status' });
    }
};

module.exports = { createOrderRequest, getOrderRequests, updateOrderRequestStatus };
