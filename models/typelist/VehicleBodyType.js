const mongoose = require('mongoose');
const { typelistSchema } = require('./../Shared');

const VehicleBodyType = new mongoose.Schema(typelistSchema, { collection: 'tl_vehiclebodytype' });

module.exports = mongoose.model('VehicleBodyType', VehicleBodyType);

