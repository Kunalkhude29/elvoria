const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const formatProduct = (product) => {
    if (!product) return product;

    // Safely extract the first image
    let defaultImage = null;
    if (Array.isArray(product.images) && product.images.length > 0) {
        defaultImage = product.images[0];
    } else if (typeof product.images === 'string' && product.images !== '') {
        defaultImage = product.images;
    }

    return {
        ...product,
        id: product.id ? product.id.toString() : undefined,
        price: Number(product.price),
        image: defaultImage,
        category: product.category ? product.category.name : 'Uncategorized',
        collection: product.collection ? product.collection.name : null,
    };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const { category, collection, featured } = req.query;
    const where = {};

    if (category) where.category = { name: category };
    if (collection) where.collection = { name: collection };
    // if (featured) ...

    try {
        const products = await prisma.product.findMany({
            where,
            include: { category: true, collection: true },
        });
        res.json(products.map(formatProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(req.params.id) }, // Prisma uses Int IDs by default
            include: { category: true, collection: true },
        });

        if (product) {
            res.json(formatProduct(product));
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, price, description, categoryId, collectionId, stock, images } = req.body;
    // req.files would handle create with images, simplified here

    try {
        const product = await prisma.product.create({
            data: {
                name,
                price: Number(price),
                description,
                categoryId: Number(categoryId), // assuming ID passed
                collectionId: collectionId ? Number(collectionId) : null,
                stock: Number(stock),
                images: images || [], // Save image payload or default empty
            },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Product creation failed: ' + error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, price, description, categoryId, collectionId, stock, images } = req.body;

    try {
        const updateData = {
            name,
            price: Number(price),
            description,
            categoryId: Number(categoryId),
            collectionId: collectionId ? Number(collectionId) : null,
            stock: Number(stock),
        };

        if (images && Array.isArray(images) && images.length > 0) {
            updateData.images = images;
        }

        const product = await prisma.product.update({
            where: { id: Number(req.params.id) },
            data: updateData,
        });
        res.json(product);
    } catch (error) {
        res.status(404).json({ message: 'Product not found or update failed: ' + error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: 'Product removed' });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Cannot delete product: It is associated with existing orders. You may update its stock to 0 instead.' });
        }
        res.status(404).json({ message: 'Product not found or could not be deleted.' });
    }
};

module.exports = {
    getProducts,
    getCategories,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
