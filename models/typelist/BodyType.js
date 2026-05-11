const mongoose = require('mongoose');
const { typelistSchema } = require('../Shared');

const BodyType = new mongoose.Schema(typelistSchema, { collection: 'tl_bodytype' });
module.exports = mongoose.model('BodyType', BodyType);

