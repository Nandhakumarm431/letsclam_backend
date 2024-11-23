module.exports = (sequelize, Sequelize) => {
    const VideoFile = sequelize.define('video_file', {
        title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        videoType: {
            type: Sequelize.STRING
        },
        fileName:{
            type:Sequelize.STRING 
        },
        fileUrl:{
            type:Sequelize.STRING
        }
    })
    return VideoFile
}