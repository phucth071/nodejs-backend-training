'use strict'

const _ = require('lodash');

const { Types } = require('mongoose');

const convertToObjectIdMongodb = id => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick( object, fields );
};

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map( field => [field, 1] ));
}

const unGetSelectData = (unSelect = []) => {
    return Object.fromEntries(unSelect.map( field => [field, 0] ));
}

const removeUndefinedObj = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null) {
            delete obj[key];
        }
    });

    return obj;
}

const nestedObjectParser = (obj) => {
    const final = {}
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null ){
            const resposne = nestedObjectParser(obj[key])
            Object.keys(resposne).forEach( k => {
                final[`${key}.${k}`] = resposne[k]
            })
        } else {
            final[key] = obj[key]
        }
    })

    return final
}

module.exports = { 
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObj,
    nestedObjectParser,
    convertToObjectIdMongodb
}