const prisma = require('../lib/prisma');

// @desc    Fetch reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
    try {
        const { productId, rating, title, content, userName, userEmail, images } = req.body;

        if (!productId || !rating || !content || !userName || !userEmail) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const review = await prisma.review.create({
            data: {
                productId: parseInt(productId),
                rating: parseInt(rating),
                title,
                content,
                userName,
                userEmail,
                images: images || [], // JSON array of image URLs
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
};

// @desc    Check if user is eligible to write a review
// @route   GET /api/reviews/check-eligibility/:productId
// @access  Private
const checkReviewEligibility = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        
        if (req.user.role === 'ADMIN') {
            return res.json({ eligible: true });
        }

        const hasOrdered = await prisma.order.findFirst({
            where: {
                userId: req.user.id,
                items: {
                    some: { productId }
                }
            }
        });

        if (hasOrdered) {
            return res.json({ eligible: true });
        }

        return res.json({ eligible: false, message: 'buy a product to write a review' });
    } catch (error) {
        console.error("Error checking eligibility:", error);
        res.status(500).json({ message: 'Failed to check eligibility' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.review.delete({
            where: { id }
        });
        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: 'Failed to delete review' });
    }
};

// @desc    Vote on a review
// @route   POST /api/reviews/:id/vote
// @access  Public
const voteReview = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { type } = req.body; // 'helpful' or 'notHelpful'

        if (type === 'helpful') {
            await prisma.review.update({
                where: { id },
                data: { helpfulCount: { increment: 1 } }
            });
        } else if (type === 'notHelpful') {
            await prisma.review.update({
                where: { id },
                data: { notHelpfulCount: { increment: 1 } }
            });
        }

        res.json({ message: 'Vote recorded' });
    } catch (error) {
        console.error("Error voting on review:", error);
        res.status(500).json({ message: 'Failed to record vote' });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    checkReviewEligibility,
    deleteReview,
    voteReview
};
