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
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.statusCode = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: message
    });
});

module.exports = app;