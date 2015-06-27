var db = require("../models");

var routeHelpers = {

	// check that access token in params matches access token in db
	ensureSameSpotifyUser: function(req, res, next){
		console.log(req.query.access_token, "access_token from req.query");
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

	ensureSameSpotifyUserLoggedIn: function(req, res, next){
		// console.log(req.query.access_token, "access_token from params");
		db.User.findById(req.params.user_id, function(err, user){
			if(user.accessToken != req.session.id){
				res.redirect("/errors/500");
			} else {
				return next();
			}
		});
	},

	// ifLoggedInDisplayUserInfo: function(req, res, next){
	// 	if(req.session.id !== null && req.session.id !== undefined){
	// 		db.User.findOne({accessToken:req.query.access_token}, function(err, user){
	// 			res.render("users/index", {user:user});
	// 		});
	// 	} else {
	// 		return next();
	// 	}
	// },


	// stop users from logging in more than once during a session
	// don't let people logged in visit the login or the sign up page
	// use this in the login and signup routes
	// loggedInStop: function(req, res, next){
	// 	if(req.session.id !== null && req.session.id !== undefined){
	// 		res.redirect("/index");
	// 	} else {
	// 		return next();
	// 	}
	// }

};

module.exports = routeHelpers;