'use strict'

const crypto = require('crypto');

function generateKeyPair() {
  const privateKey = crypto.randomBytes(64).toString('hex');
  const publicKey = crypto.randomBytes(64).toString('hex');

  return { privateKey, publicKey };
}

module.exports = generateKeyPair;