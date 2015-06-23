var mongoose = require("mongoose");

// will need to add an OR option once I host this
mongoose.connect("mongodb://localhost/spotify_guessing_game_app");

mongoose.set("debug", true);

module.exports.User = require("./user");
module.exports.Song = require("./song");
module.exports.Playlist = require("./playlist");
module.exports.Round = require("./round");