const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const ContactRole = new mongoose.Schema(typelistSchema, { collection: 'tl_contactrole' });
module.exports = mongoose.model('ContactRole', ContactRole);
