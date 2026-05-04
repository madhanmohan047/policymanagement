const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { ID_PREFIX } = require('./../constants/constants')

const generateId = () => `${ID_PREFIX}${randomUUID().substring(0, 8)}`;

const typeCodeSchema = new mongoose.Schema({
    code: String,
    name: String
}, { _id: false });


module.exports = { generateId, typeCodeSchema };