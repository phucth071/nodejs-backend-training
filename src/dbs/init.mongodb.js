'use strict'

const mongoose = require('mongoose');
const { connect } = require('../app');

const {db: {host, port, name}} = require('../configs/mongodb.config');
const connectString = `mongodb://${host}:${port}/${name}`;
console.log(connectString);
const { countConnect } = require('../helpers/check.connect.js');

class Database {
    constructor() {
        this.connect();
    }

    connect(type = 'mongodb') {
        
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', {color: true});
        }

        mongoose.connect(connectString, {
            maxPoolSize: 50
        }).then(() => {
            console.log('Connected to MongoDB');
            countConnect();
        }).catch((err) => {
            console.log('Failed to connect to MongoDB', err);
        });
    }
    
    static getInstance() {
        if (!this.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

}

const instance = Database.getInstance();
module.exports = instance;
