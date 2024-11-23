const path = require('path');

module.exports = {
    // UPLOAD_FOLDER: path.join(__dirname, 'upload/audios'),
    ALLOWED_EXTENSIONS_AUDIO: ['wav', 'mp3', 'ogg', 'm4a','mpeg'],
    ALLOWED_EXTENSIONS_VIDEO: ['mp4','AVI','MOV'],
    STORAGE_TYPE: process.env.STORAGE_TYPE || 's3', // Switch between 'local' and 's3'
};