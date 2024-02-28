const express = require('express');
const app = express();


const { default: helmet } = require('helmet');
const morgan = require('morgan');


// Init Middleware

// morgan: dev, combined, common, short, tiny
app.use(morgan('dev'));
app.use(helmet());

// Init db

// Routes
app.get('/', (req, res, next) => {
    return res.status(200).json({
        message: 'Server is running'
    });
});
// Handling error



module.exports = app;