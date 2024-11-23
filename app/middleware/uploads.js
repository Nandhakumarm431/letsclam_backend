const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const { ALLOWED_EXTENSIONS_AUDIO, ALLOWED_EXTENSIONS_VIDEO } = require('../config/file.config');
const logger = require('../logger/logger');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
});
const s3 = new AWS.S3();

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase().substring(1);
        if (!ALLOWED_EXTENSIONS_AUDIO.includes(ext) && !ALLOWED_EXTENSIONS_VIDEO.includes(ext)) {
            const error = new Error('File type not allowed');
            logger.warn(`File upload failed: ${error.message}`);
            return cb(error, false);
        }
        cb(null, true);
    }
}).single('file');

// Middleware to handle S3 upload
async function uploadMiddleware(req, res, next) {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            logger.error(`Multer error: ${err.message}`);
            return res.status(400).json({ error: err.message });
        } else if (err) {
            logger.error(`File upload error: ${err.message}`);
            return res.status(400).json({ error: err.message });
        }

        // Ensure a file is uploaded
        if (!req.file) {
            const errorMessage = 'No file uploaded';
            logger.warn(errorMessage);
            return res.status(400).json({ error: errorMessage });
        }

        const ext = path.extname(req.file.originalname).toLowerCase().substring(1);
        const folder = ALLOWED_EXTENSIONS_AUDIO.includes(ext) ? 'audio' : 'video';
        const s3Key = `${folder}/${Date.now()}-${req.file.originalname}`;

        // S3 upload parameters
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        try {
            const s3Response = await s3.upload(params).promise();
            console.log(`File uploaded to S3: ${s3Response.Location}`);
            logger.info(`File uploaded to S3: ${s3Response.Location}`);

            // Attach the S3 URL to the request for further processing
            req.file.name = s3Key;
            req.file.location = s3Response.Location;
            next();
        } catch (s3Err) {
            logger.error(`Failed to upload file to S3: ${s3Err.message}`);
            return res.status(500).json({ error: 'Failed to upload file to S3' });
        }
    });
}

module.exports = uploadMiddleware;
