const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { products: true }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: Number(req.params.id) },
            include: { products: true }
        });
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name, image } = req.body;
    try {
        const category = await prisma.category.create({
            data: {
                name,
                image
            }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Invalid category data: ' + error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name, image } = req.body;
    try {
        const updateData = {
            name
        };

        if (image !== undefined) {
            updateData.image = image;
        }

        const category = await prisma.category.update({
            where: { id: Number(req.params.id) },
            data: updateData
        });
        res.json(category);
    } catch (error) {
        res.status(404).json({ message: 'Category not found or update failed: ' + error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        await prisma.category.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: 'Category removed' });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Cannot delete category: It contains existing products. Remove the products first.' });
        }
        res.status(404).json({ message: 'Category not found or could not be deleted' });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
