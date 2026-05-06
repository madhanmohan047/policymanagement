const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const Country = new mongoose.Schema(typelistSchema, { collection: 'tl_country' });

module.exports = mongoose.model('Country', Country);