const express = require('express');
const router = express.Router();
const { getHomepageImages, updateHomepageImage } = require('../controllers/homepageImageController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getHomepageImages);
router.put('/:key', protect, admin, updateHomepageImage);

module.exports = router;
