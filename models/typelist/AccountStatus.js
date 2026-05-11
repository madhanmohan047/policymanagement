const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const AccountStatus = new mongoose.Schema(typelistSchema, { collection: 'tl_accountstatus' });
module.exports = mongoose.model('AccountStatus', AccountStatus);