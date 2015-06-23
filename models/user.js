var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

var mongoose = require("mongoose");
mongoose.set("debug", true);

var userSchema = new mongoose.Schema({
	username: {
		type: String,
		lowercase: true,
		required: true
	},
	email: {
		type: String,
		lowercase: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	avatarUrl: String,
	genres: [],
	numCorrect: Number,
	numIncorrect: Number,
	pointTally: Number,
	rank: Number,
	fastestTimeToGuess: Number,
	friends: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}],
	playlists: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Playlist"
	}],
	rounds: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Round"
	}]
});

// need to add in more functions here for bcrypt and user auth
// when I get to that part

var User = mongoose.model("User", userSchema);
module.exports = User;

