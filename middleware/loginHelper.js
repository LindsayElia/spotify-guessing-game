var db = require("../models");

var loginHelpers = function(req, res, next){

	// set session id to match user id
	req.login = function(user){
		req.session.id = user._id;	// I think ._id is the same as .id, 
		// either will work with mongoose, both point to the document id in our database
	};

	// set session id to null
	req.logout = function(){
		req.session.id = null;
	};

	// continue to next part of code
	next();

};

module.exports = loginHelpers;
