const mongoose = require("mongoose");
//const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String
	},
	walletAddress: {
		type: String,
		required: true,
	},
}, autoCreate=  true);

module.exports = mongoose.model("User", userSchema);
