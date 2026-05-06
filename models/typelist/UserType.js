const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const UserType = new mongoose.Schema(typelistSchema, { collection: 'tl_usertype' });

module.exports = mongoose.model('UserType', UserType);