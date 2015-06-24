var db = require("../models");

var routeHelpters = {

	// ensure that user is logged in
	// if user is not logged in, session id will be null(most times) or undefined(first time)
	ensureLoggedIn: function(req, res, next){
		if(req.session.id !== null && req.session.id !== undefined){
			return next();
		} else {
			res.redirect("/login");
		}
	},

	// ensure user id matches session id
	ensureCorrectUser: function(req, res, next){
		db.User.findById(req.params.id, function(err, user){
			if(user.id !== req.session.id){
				res.redirect("/index");
			} else {
				return next();
			}
		});
	},

	// stop users from logging in more than once during a session
	preventLoginSignup: function(req, res, next){
		if(req.session.id !== null && req.session.id !== undefined){
			res.redirect("/index");
		} else {
			return next();
		}
	}

};

module.exports = routeHelpters;