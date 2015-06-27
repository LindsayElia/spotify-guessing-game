var db = require("../models");

var loginHelpers = function(req, res, next){

	// Spotify login - set the session id to be the access token from spotify
	req.login = function(access_token){
		req.session.id = access_token;
		// console.log(req.session.id, "req.session.id set to this");
	};

	// set session id to null
	req.logout = function(){
		req.session.id = null;
	};

	// continue to next part of code
	next();

};

module.exports = loginHelpers;


















