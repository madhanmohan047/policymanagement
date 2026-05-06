const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { ID_PREFIX } = require('./../constants/constants')

const generateId = () => `${ID_PREFIX}${randomUUID().substring(0, 8)}`;

const typelistSchema = {
    code: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },               
    retired: { type: Boolean, default: false },           
    priority: { type: Number, default: 0 }
}; 


module.exports = { generateId, typelistSchema };