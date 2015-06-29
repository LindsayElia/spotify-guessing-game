var mongoose = require("mongoose");
mongoose.set("debug", true);

var playlistSchema = new mongoose.Schema({
	playlistId: {
		type: String,
		unique: true
	},
	playlistName: String,
	trackIds: []		// songs with track-title & track-id
});

var Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;

