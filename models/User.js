var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;

var UserSchema = Schema({
	email: {type: String, required: true, unique: true, trim: true},
	password_hash: {type: String, default: null},
	password_length: {type: Number, default: null},

	name: {
		first: String,
		last: String
	},

	social_links: {
		facebook: String,
		twitter: String,
		linkedin: String,
		googleplus: String,
		skype: String,
		github: String,
		bitbucket: String,
	},

	gender: String,
	birthday: { type: Date, default: Date.now },

	registered: { type: Date, default: Date.now },
	last_login: { type: Date, default: Date.now },

	isRoot: {type: Boolean, default: false}
});

UserSchema
.virtual('name.full')
.get(function() {
	return this.name.first + ' ' + this.name.last;
});


UserSchema
.virtual('password')
.set(function(password) {
	if(!password) {
		this.password_length = 0;
		this.password_hash = null;
		return;
	}
	this.password_hash = crypto.createHash('sha256').update(password).digest('base64');
	this.password_length = password.length;
});

UserSchema
.path('password_length')
.validate(function(password_length) {
	return password_length && password_length > 6;
});

UserSchema
.path("email")
.validate(function(email) {
	return email && !!email.match(/^.+\@.+/);
});

UserSchema.methods.passwordMatches = function(password) {
	var password_hash = crypto.createHash('sha256').update(password).digest('base64');
	if(this.password_hash == password_hash) { return true; }
	return false;
};


module.exports = mongoose.model('User', UserSchema);