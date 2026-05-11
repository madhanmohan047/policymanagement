const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const ContactType = new mongoose.Schema(typelistSchema, { collection: 'tl_contacttype' });
module.exports = mongoose.model('ContactType', ContactType);