var db = require("../models");

var loginHelpers = function(req, res, next){

	// set session id to match user id
	// req.login = function(user){
	// 	req.session.id = user._id;	// I think ._id is the same as .id, 
	// 	// either will work with mongoose, both point to the document id in our database
	// };

	// set session id to null
	req.logout = function(){
		req.session.id = null;
	};

	// Spotify login - set the session id to be the access token from spotify
	req.login = function(access_token){
		req.session.id = access_token;
		console.log(req.session.id, "req.session.id set to this");
	};

	// continue to next part of code
	next();

};

module.exports = loginHelpers;





















