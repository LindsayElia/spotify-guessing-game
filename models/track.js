var mongoose = require("mongoose");
mongoose.set("debug", true);

var trackSchema = new mongoose.Schema({
	trackId: {
		type: String,
		unique: true
	},
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