var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var XKCDSchema = Schema({
	num: {type: Number, required: true, unique: true},
	title: {type: String, trim: true},
	alt: {type: String, trim: true}
	img: {type: String, trim: true}
});

module.exports = mongoose.model('XKCD', XKCDSchema);