module.exports = (sequelize, Sequelize) => {
    const AudioFile = sequelize.define('audio_file', {
        title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        audioType: {
            type: Sequelize.STRING
        },
        fileName:{
            type:Sequelize.STRING 
        },
        fileUrl:{
            type:Sequelize.STRING
        },
        isGeneric:{
            type:Sequelize.BOOLEAN
        }
    })
    return AudioFile
}