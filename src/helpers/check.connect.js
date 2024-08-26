'use strict'

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

const _SECOND = 5000;

const countConnect = () => {
    const numConnect = mongoose.connections.length;
    console.log(`Number of connections: ${numConnect}`);
}

const checkOverLoad = () => {
    setInterval(() => {
        const numConnect = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        // Example maximum connection based on the number of cores
        const maxConnection = numCores * 5;

        console.log('Number of connections: ', numConnect);
        console.log('Memory usage: ', memoryUsage/1024/1024, 'MB');

        if (numConnect > maxConnection) {
            console.log(`Overload, number of connections: ${numConnect}`);
            console.log(`Number of cores: ${numCores}`);
            console.log(`Memory usage: ${memoryUsage}`);
            process.exit(1);
        }

    }, _SECOND);
}

module.exports = { countConnect, checkOverLoad }