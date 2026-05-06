const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const JobType = new mongoose.Schema(typelistSchema, { collection: 'tl_jobtype' });

module.exports = mongoose.model('JobType', JobType);