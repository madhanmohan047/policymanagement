const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const PolicyStatus = new mongoose.Schema(typelistSchema, { collection: 'tl_polstatus' });

module.exports = mongoose.model('PolicyStatus', PolicyStatus);