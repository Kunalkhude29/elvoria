const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/myorders').get(protect, getMyOrders);
router.route('/').post(createOrder).get(protect, admin, getOrders);
router.route('/:id').get(protect, admin, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);




module.exports = router;
