var db = require("../models");

var loginHelpers = function(req, res, next){

	// set session id to match user id
	req.login = function(user){
		req.session.id = user._id;	// is ._id the same as .id ? I think so?
	};

	// set session id to null
	req.logout = function(){
		req.session.id = null;
	};

	// continue to next part of code
	next();

};

module.exports = loginHelpers;
