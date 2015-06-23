var mongoose = require("mongoose");
mongoose.set("debug", true);

var roundSchema = new mongoose.Schema({
	correct: Number,
	incorrect: Number,
	playlist: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Playlist"
	},
	userPlaying: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	// userChallenging: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "User"
	// },
});

var Round = mongoose.model("Round", roundSchema);
module.exports = Round;