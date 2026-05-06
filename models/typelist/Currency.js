const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const Currency = new mongoose.Schema(typelistSchema, { collection: 'tl_currency' });

module.exports = mongoose.model('Currency', Currency);