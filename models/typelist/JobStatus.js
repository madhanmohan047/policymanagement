const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const JobStatus = new mongoose.Schema(typelistSchema, { collection: 'tl_jobstatus' });
module.exports = mongoose.model('JobStatus', JobStatus);