var db = require("../models");

var routeHelpers = {

	// if a user is not logged in, session id will be null(most times) or undefined(first time)
	loggedInContinue: function(req, res, next){
		if(req.session.id !== null && req.session.id !== undefined){
			return next();
		} else {
			res.redirect("/login");
		}
	},
	
	// check that user is logged in as a certain user
	ensureSameUser: function(req, res, next){
		db.User.findById(req.params.user_id, function(err, user){
			// console.log(typeof user._id);
			// console.log(typeof req.session.id);
			var userIdAsString = user._id.toString();
			if(userIdAsString !== req.session.id){
				res.redirect("/index");
			} else {
				return next();
			}
		});
	},

	// stop users from logging in more than once during a session
	// don't let people logged in visit the login or the sign up page
	// use this in the login and signup routes
	loggedInStop: function(req, res, next){
		if(req.session.id !== null && req.session.id !== undefined){
			res.redirect("/index");
		} else {
			return next();
		}
	}

};

module.exports = routeHelpers;