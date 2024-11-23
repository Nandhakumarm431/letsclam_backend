const uploadMiddleware = require('../middleware/uploads')

module.exports = app => {
    const videoFileAPI = require('../controllers/videofile.controller')

    app.post('/uploadvfile', uploadMiddleware, videoFileAPI.uploadVideo)
    app.get('/video_files/:user_id', videoFileAPI.getVideoFilesByUser);
    app.post('/play_video', videoFileAPI.playVideo);

}