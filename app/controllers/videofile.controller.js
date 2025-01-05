const db = require('../models');
const VideoFileDB = db.videoFiles;
const logger = require('../logger/logger');
const axios = require('axios');
const { Op } = require('sequelize');

exports.uploadVideo = async (req, res) => {
    try {
        const { user_id, description, title, videoType } = req.body;
        const file = req.file;


        if (!user_id) {
            logger.warn('Upload attempt without user_id');
            return res.status(400).json({ error: 'User ID is required' });
        }

        let fileUrl;
        fileUrl = file.location; // S3 file URL provided in the middleware

        // Save file information and description to the database
        const videoFile = await VideoFileDB.create({
            userId: user_id,
            fileName: file.name,
            fileUrl: fileUrl,
            title: title,
            description: description || '',
            videoType: videoType
        });

        logger.info(`Video uploaded by user ${user_id}: ${file.filename} (${fileUrl})`);
        res.status(201).json({
            message: 'Video file uploaded successfully',
            filename: file.filename,
            fileUrl: fileUrl // Include file URL in the response
        });
    } catch (error) {
        logger.error(`Error uploading video file for user ${req.body.user_id}: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVideoFilesByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const videoFiles = await VideoFileDB.findAll({
            where: {
                [Op.or]: [
                    { userId: user_id },
                    { isGeneric: true }
                ]
            },
        });
        if (!videoFiles.length) {
            logger.info(`No video files found for user ${user_id}`);
            return res.status(404).json({ error: 'No video files found for this user' });
        }

        logger.info(`Fetched ${videoFiles.length} video files for user ${user_id}`);
        res.status(200).json({ videoFiles });
    } catch (error) {
        logger.error(`Error fetching video files for user ${req.params.user_id}: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.playVideo = async (req, res) => {
    console.log('Incoming request body:', req.body);

    try {
        const { filePath } = req.body;

        if (!filePath) {
            logger.info('File path is required in the request body');
            return res.status(400).json({ error: 'File path is required in the request body' });
        }

        //Lambda URL
        const lambdaUrl = process.env.AWS_LAMBDA_URL_DOWNLOAD_FILE;

        const lambdaResponse = await axios.post(lambdaUrl, { file_path: filePath });

        if (!lambdaResponse.data || !lambdaResponse.data.download_url) {
            logger.error(`Failed to fetch presigned URL for this filePath - ${filePath}`)
            return res.status(500).json({ error: 'Failed to fetch presigned URL' });
        }

        const presignedUrl = lambdaResponse.data.download_url;
        const videoResponse = await axios.get(presignedUrl, { responseType: 'stream' });

        // Set appropriate headers
        res.setHeader('Content-Type', videoResponse.headers['content-type'] || 'video/mp4');
        res.setHeader('Content-Disposition', `inline; filename="${filePath.split('/').pop()}"`);

        logger.info(`Playing video file using the file path ${filePath}`)
        videoResponse.data.pipe(res);

    } catch (error) {
        logger.error(`Error playing video file: ${error}`)
        res.status(500).json({ error: 'Internal server error' });
    }
};
