const prisma = require('../lib/prisma');

// @desc    Get all homepage images
// @route   GET /api/homepage-images
// @access  Public
const getHomepageImages = async (req, res) => {
    try {
        const images = await prisma.homepageImage.findMany();
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upsert a homepage image by key
// @route   PUT /api/homepage-images/:key
// @access  Private/Admin
const updateHomepageImage = async (req, res) => {
    const { key } = req.params;
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ message: 'Image URL is required' });
    }
    try {
        const record = await prisma.homepageImage.upsert({
            where: { key },
            update: { image },
            create: { key, image }
        });
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getHomepageImages, updateHomepageImage };
