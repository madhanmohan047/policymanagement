const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const State = new mongoose.Schema(typelistSchema, { collection: 'tl_state' });
module.exports = mongoose.model('State', State);