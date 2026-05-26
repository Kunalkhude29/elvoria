const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { uploadFromBuffer } = require('../lib/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Saves a file buffer locally to the uploads directory.
 * Used as a fallback during local development if Cloudinary credentials are not present.
 */
const saveToLocalDisk = (file) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${filename}`;
};

/**
 * Handles uploading a single file, prioritizing Cloudinary and falling back to disk storage.
 */
const handleUpload = async (file) => {
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_SECRET;
                         
    if (hasCloudinary) {
        const result = await uploadFromBuffer(file.buffer, 'elvoria');
        return result.secure_url;
    } else {
        console.warn('[UPLOAD] Cloudinary credentials missing in .env, falling back to local file storage.');
        return saveToLocalDisk(file);
    }
};

// Single image upload route (returns plain text URL string)
router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image provided');
    }
    try {
        const url = await handleUpload(req.file);
        res.send(url);
    } catch (err) {
        console.error('[UPLOAD] Single upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Multiple image upload route (returns JSON array of URL strings)
router.post('/multiple', upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images provided' });
    }
    try {
        const uploadPromises = req.files.map(file => handleUpload(file));
        const urls = await Promise.all(uploadPromises);
        res.json(urls);
    } catch (err) {
        console.error('[UPLOAD] Multiple upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

module.exports = router;
