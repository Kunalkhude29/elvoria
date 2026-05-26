const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<object>} - Cloudinary upload response
 */
const uploadFromBuffer = (buffer, folder = 'elvoria') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

module.exports = {
    cloudinary,
    uploadFromBuffer,
};
