const uploadMiddleware = require('../middleware/uploads')

module.exports = app => {
    const audioFileAPI = require('../controllers/audiofile.controller')

    app.post('/uploadfile', uploadMiddleware, audioFileAPI.uploadAudio)
    app.get('/audio_files/:user_id', audioFileAPI.getAudioFilesByUser);
    app.post('/play_audio', audioFileAPI.playAudio);

}