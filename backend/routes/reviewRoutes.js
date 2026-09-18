const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, checkReviewEligibility, deleteReview, voteReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').post(createReview);
router.route('/product/:id').get(getProductReviews);
router.route('/check-eligibility/:productId').get(protect, checkReviewEligibility);
router.route('/:id').delete(protect, admin, deleteReview);
router.route('/:id/vote').post(voteReview);

module.exports = router;
