var mongoose = require("mongoose");
mongoose.set("debug", true);

var trackSchema = new mongoose.Schema({
	trackId: {
		type: String,
		unique: true
	},					// tracks are not associated with playlists or users here in the tracks model,
						// because we are referencing them from the playlist model
	title: String,
	artist: Array,  	// spotify sends this out as an array
	album: String,
	artworkUrl: String,
	previewUrl: String,
	fullSpotifyUrl: String
});

var Track = mongoose.model("Track", trackSchema);
module.exports = Track;