const express = require('express')
const cors = require('cors')
const logger = require('./app/logger/logger');
const app = express()
require('dotenv').config();

global.__basedir = __dirname;

var corsOptions = {
    origin: '*'
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Middleware to log API requests
app.use((req, res, next) => {
    logger.info(`API Request: ${req.method} ${req.url} - Query: ${JSON.stringify(req.query)} - Body: ${JSON.stringify(req.body)}`);
    next();
});
// database

const db = require('./app/models');
const { UPLOAD_FOLDER } = require('./app/config/file.config');
const Role = db.role
db.sequelize.sync();

// db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Database with { force: true }');
//     initial();
// });

// app.get('/api/sqlstatus',(req,res)=>{
//     db.sequelize.sync({force: true}).then(() => {
//       res.status(200).json({status:"MYSQL connected"});
//     }).catch(error=>{
//       res.status(400).json({status:error});
//     }
//     )
//   });

// app.use('/uploads', express.static(UPLOAD_FOLDER));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to LetsClam application.' })
})

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/audiofile.routes')(app);
require('./app/routes/videofile.routes')(app);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})


// function initial() {
//     Role.create({
//         id: 1,
//         name: "user",
//         role_type: "P"
//     });
//     Role.create({
//         id: 2,
//         name: "admin",
//         role_type: "P"
//     });
//     Role.create({
//         id: 3,
//         name: "Super Admin",
//         role_type: "P"
//     });
// }