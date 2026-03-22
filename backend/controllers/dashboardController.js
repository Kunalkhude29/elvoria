const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Aggregate statistics concurrently
        const [totalRevenueResult, totalOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
            // Calculate total revenue from delivered orders
            prisma.order.findMany({
                where: { status: 'DELIVERED' },
                select: { total: true }
            }).then(orders => orders.reduce((acc, order) => acc + Number(order.total || 0), 0)),
            // Count total orders
            prisma.order.count(),
            // Count total products
            prisma.product.count(),
            // Count total customers (role: USER)
            prisma.user.count({
                where: {
                    role: 'USER'
                }
            }),
            // Fetch 5 most recent orders
            prisma.order.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: { email: true }
                    }
                }
            })
        ]);

        const totalRevenue = typeof totalRevenueResult === 'number' ? totalRevenueResult : 0;

        res.json({
            totalRevenue,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error fetching dashboard stats' });
    }
};

module.exports = {
    getDashboardStats
};
