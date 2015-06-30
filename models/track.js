var mongoose = require("mongoose");
mongoose.set("debug", true);

var trackSchema = new mongoose.Schema({
	trackIdplaylistId: {
		type: Object,
		unique: true
	},
	// getting the track id + the playlistId in case there are
	// multiple user playlists with the same track id
	// so I can find unique tracks when I need to search my database
	playlistId: String,	
	spotifyId: String,
	title: String,
	artist: Array,  // spotify sends this out as an array
	album: String,
	artworkUrl: String,
	previewUrl: String,
	fullSpotifyUrl: String
});

var Track = mongoose.model("Track", trackSchema);
module.exports = Track;