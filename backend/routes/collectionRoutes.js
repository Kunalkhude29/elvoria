const express = require('express');
const router = express.Router();
const {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    addBanner,
    updateBanner,
    deleteBanner
} = require('../controllers/collectionController');

const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(getCollections).post(protect, admin, createCollection);
router.route('/:id/banners').post(protect, admin, addBanner);
router.route('/banners/:bannerId').put(protect, admin, updateBanner).delete(protect, admin, deleteBanner);
router.route('/:id').get(getCollectionById).put(protect, admin, updateCollection).delete(protect, admin, deleteCollection);

module.exports = router;
