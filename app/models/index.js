const config = require('../config/db.config.js')

const Sequelize = require('sequelize');
const logger = require('../logger/logger.js');

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,
    dialectOptions: config.dialectOptions,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    logging: (msg) => logger.info(msg) 

  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//  User Authentication model

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.ROLES = ["user", "admin", "Super Admin"]
db.userOTPVerification = require("../models/UserOTPVerification.model.js")(sequelize, Sequelize);

db.role.hasMany(db.user, { as: 'users' });
db.user.belongsTo(db.role, {
  foreignKey: 'roleId',
  as: 'roles'
})

db.audioFiles = require('../models/audioFile.model.js')(sequelize,Sequelize);
db.user.hasMany(db.audioFiles,{as:'audio_file'})

db.videoFiles = require('../models/videoFile.model.js')(sequelize,Sequelize);
db.user.hasMany(db.videoFiles,{as:'video_file'})



module.exports = db, sequelize;