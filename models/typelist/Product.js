const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const Product = new mongoose.Schema(typelistSchema, { collection: 'tl_product' });
module.exports = mongoose.model('Product', Product);