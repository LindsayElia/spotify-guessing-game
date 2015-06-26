var db = require("../models");

var routeHelpers = {

	// if a user is not logged in, session id will be null(most times) or undefined(first time)
	// I'm not using this anywhere??
	spotifyUserLoggedInContinue: function(req, res, next){
		if(req.session.id !== null && req.session.id !== undefined){
			return next();
		} else {
			res.redirect("/login");
		}
	},

	
	// check that user is logged in as a certain user
	// ensureSameUser: function(req, res, next){
	// 	db.User.findById(req.params.user_id, function(err, user){
	// 		// console.log(typeof user._id);
	// 		// console.log(typeof req.session.id);
	// 		// var userIdAsString = user._id.toString();
	// 		// if(userIdAsString !== req.session.id){
	// 		if(user._id != req.session.id){
	// 			console.log("error with routeHelper.ensureSameUser");
	// 			res.redirect("/errors/500");
	// 		} else {
	// 			return next();
	// 		}
	// 	});
	// },

	// check that access token in params matches access token in db
	ensureSameSpotifyUser: function(req, res, next){
		console.log(req.query.access_token, "access_token from params");
		db.User.findOne({accessToken:req.query.access_token}, function(err, user){
			console.log(user, "user we get from findOne");
			if(user.accessToken != req.session.id){
				console.log(user, "user we are logging inside of SameSpotifyUser");
				console.log(user.accessToken, "user.accessToken we are logging inside of SameSpotifyUser");
				console.log(req.session.id, "req.session.id we are logging inside of SameSpotifyUser");
				console.log("error with routeHelper.ensureSameSpotifyUser");
				res.redirect("/errors/500");
			} else {
				console.log("saved with accessToken::: ", user.accessToken);
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