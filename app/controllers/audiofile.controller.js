const db = require('../models')
const AudioFileDB = db.audioFiles;
const logger = require('../logger/logger');
const axios = require('axios');
const { Op } = require('sequelize');


exports.uploadAudio = async (req, res) => {
  try {
    const { user_id, description, title } = req.body;
    const file = req.file;

    if (!user_id) {
      logger.warn('Upload attempt without user_id');
      return res.status(400).json({ error: 'User ID is required' });
    }

    let fileUrl;
    fileUrl = file.location;
    
    // Save file information to the database
    const audioFile = await AudioFileDB.create({
      userId: user_id,
      fileName: file.name,
      fileUrl: fileUrl,
      title: title,
      description: description || ''
    });

    logger.info(`Audio uploaded by user ${user_id}: ${file.name} (${fileUrl})`);
    res.status(200).json({
      message: 'Audio file uploaded successfully',
      filename: file.name,
      fileUrl: fileUrl // Include file URL in the response
    });
  } catch (error) {
    logger.error(`Error uploading video file for user ${req.body.user_id}: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch all files for a given user
exports.getAudioFilesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const audioFiles = await AudioFileDB.findAll({
      where: { 
        [Op.or]: [
          { userId: user_id },  
          { isGeneric: true }   
        ]
       },
      // attributes: ['fileName', 'fileUrl', 'description']
    });

    if (!audioFiles.length) {
      logger.info(`No audio files found for user ${user_id}`);
      return res.status(404).json({ error: 'No audio files found for this user' });
    }

    logger.info(`Fetched ${audioFiles.length} audio files for user ${user_id}`);
    res.status(200).json({ audioFiles });
  } catch (error) {
    logger.error(`Error fetching video files for user ${req.params.user_id}: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.playAudio = async (req, res) => {
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
    const audioResponse = await axios.get(presignedUrl, { responseType: 'stream' });

    // Set appropriate headers
    res.setHeader('Content-Type', audioResponse.headers['content-type'] || 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${filePath.split('/').pop()}"`);

    logger.info(`Playing audio file using the file path ${filePath}`)
    audioResponse.data.pipe(res);

  } catch (error) {
    logger.error(`Error playing audio file: ${error.message}`)
    res.status(500).json({ error: 'Internal server error' });
  }
};
