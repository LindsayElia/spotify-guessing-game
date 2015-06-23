var mongoose = require("mongoose");
mongoose.set("debug", true);

var playlistSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},	
	songs: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Song"
	}]
});

var Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;

