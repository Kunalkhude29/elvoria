const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all collections
// @route   GET /api/collections
// @access  Public
const getCollections = async (req, res) => {
    try {
        const collections = await prisma.collection.findMany({
            include: { products: true }
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
            include: { products: true }
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
            return res.status(400).json({ message: 'Cannot delete collection: It contains existing products. Remove the products first or set collection to inactive.' });
        }
        res.status(404).json({ message: 'Collection not found or could not be deleted' });
    }
};

module.exports = {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection
};
