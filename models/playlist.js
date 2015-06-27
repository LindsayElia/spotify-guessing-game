var mongoose = require("mongoose");
mongoose.set("debug", true);

var playlistSchema = new mongoose.Schema({
	playlistId: {
		type: String,
		unique: true
	},
	trackIds: []		// songs
});

var Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;

