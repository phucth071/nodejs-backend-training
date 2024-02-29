const express = require('express');
const app = express();


const { default: helmet } = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const bodyParser = require('body-parser');

require('dotenv').config();
// Init Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev')); // morgan: dev, combined, common, short, tiny
// app.use(helmet());
// app.use(compression());


// Init db
require('./dbs/init.mongodb');
// const { checkOverLoad } = require('./helpers/check.connect');
// checkOverLoad();

// Routes
app.use('', require('./routes/index'));

// Handling error



module.exports = app;