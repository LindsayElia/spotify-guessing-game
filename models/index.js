var mongoose = require("mongoose");
require('dotenv').load();

// will need to add an OR option once I host this
mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/spotify_guessing_game_app");

mongoose.set("debug", true);

module.exports.User = require("./user");
module.exports.Playlist = require("./playlist");
module.exports.Track = require("./track");
module.exports.Round = require("./round");