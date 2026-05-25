const express = require('express');
const router = express.Router();
const {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    updateProfile,
    upsertCheckoutProfile,
    getProfile,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use((req, res, next) => {
    if (['POST', 'PUT'].includes(req.method)) {
        console.log(`Incoming ${req.method} request to ${req.originalUrl} body:`, req.body);
    }
    next();
});

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/checkout-profile').put(protect, upsertCheckoutProfile);
router.route('/addresses').get(protect, getAddresses).post(protect, addAddress);
router.route('/addresses/:id').put(protect, updateAddress).delete(protect, deleteAddress);

module.exports = router;
