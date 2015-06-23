var mongoose = require("mongoose");
mongoose.set("debug", true);

var songSchema = new mongoose.Schema({
	title: String,
	artist: String,  // multiple artists would still be a string so I don't need an array 
	// unless I want to be able to search by artist?
	album: String,
	artworkUrl: String,
	previewUrl: String,
	fullSpotifyUrl: String
});

var Song = mongoose.model("Song", songSchema);
module.exports = Song;