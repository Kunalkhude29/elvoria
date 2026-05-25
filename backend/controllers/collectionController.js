const prisma = require('../lib/prisma');

// @desc    Get all collections
// @route   GET /api/collections
// @access  Public
const getCollections = async (req, res) => {
    try {
        const collections = await prisma.collection.findMany({
            include: {
                banners: {
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });

        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single collection
// @route   GET /api/collections/:id
// @access  Public
const getCollectionById = async (req, res) => {
    try {
        const collection = await prisma.collection.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                banners: {
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });
        if (collection) {
            res.json(collection);
        } else {
            res.status(404).json({ message: 'Collection not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a collection
// @route   POST /api/collections
// @access  Private/Admin
const createCollection = async (req, res) => {
    const { name, description, heroImage, isActive } = req.body;
    try {
        const collection = await prisma.collection.create({
            data: {
                name,
                description,
                heroImage,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        res.status(201).json(collection);
    } catch (error) {
        res.status(400).json({ message: 'Invalid collection data: ' + error.message });
    }
};

// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Private/Admin
const updateCollection = async (req, res) => {
    const { name, description, heroImage, isActive } = req.body;
    try {
        const updateData = {
            name,
            description,
            isActive
        };

        if (heroImage !== undefined) {
            updateData.heroImage = heroImage;
        }

        const collection = await prisma.collection.update({
            where: { id: Number(req.params.id) },
            data: updateData
        });
        res.json(collection);
    } catch (error) {
        res.status(404).json({ message: 'Collection not found or update failed: ' + error.message });
    }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private/Admin
const deleteCollection = async (req, res) => {
    try {
        await prisma.collection.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: 'Collection removed' });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Cannot delete banner: It is being referenced elsewhere. Set it to inactive instead.' });
        }
        res.status(404).json({ message: 'Collection not found or could not be deleted' });
    }
};

// @desc    Add a banner to a collection
// @route   POST /api/collections/:id/banners
// @access  Private/Admin
const addBanner = async (req, res) => {
    const { image, title, subtitle, offerText, ctaText, displayOrder, isActive } = req.body;
    try {
        const banner = await prisma.collectionBanner.create({
            data: {
                collectionId: Number(req.params.id),
                image,
                title,
                subtitle,
                offerText,
                ctaText,
                displayOrder: displayOrder || 0,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add banner: ' + error.message });
    }
};

// @desc    Update a banner
// @route   PUT /api/collections/banners/:bannerId
// @access  Private/Admin
const updateBanner = async (req, res) => {
    const { image, title, subtitle, offerText, ctaText, displayOrder, isActive } = req.body;
    try {
        const banner = await prisma.collectionBanner.update({
            where: { id: Number(req.params.bannerId) },
            data: {
                image,
                title,
                subtitle,
                offerText,
                ctaText,
                displayOrder,
                isActive
            }
        });
        res.json(banner);
    } catch (error) {
        res.status(404).json({ message: 'Banner not found or update failed: ' + error.message });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/collections/banners/:bannerId
// @access  Private/Admin
const deleteBanner = async (req, res) => {
    try {
        await prisma.collectionBanner.delete({
            where: { id: Number(req.params.bannerId) }
        });
        res.json({ message: 'Banner removed' });
    } catch (error) {
        res.status(404).json({ message: 'Banner not found or could not be deleted' });
    }
};

module.exports = {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    addBanner,
    updateBanner,
    deleteBanner
};
