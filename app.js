// _______REQUIRE DEPENDENCIES AND SET MIDDLEWARE_______
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var db = require("./models");
var methodOverride = require("method-override");
var session = require("cookie-session");
var morgan = require("morgan");
var loginHelper = require("./middleware/loginHelper");
var routeHelper = require("./middleware/routeHelper");
var favicon = require("serve-favicon");

// not sure this is the correct format for bringing in dotenv ?
// require('dotenv').load();

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(morgan("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(bodyParser.urlencoded({extended:true}));

// use loginHelpers functions in entire app.js file
app.use(loginHelper);

// configure & use cookie-session module
app.use(session({
	maxAge: 7200000,	// 2 hours, in milliseconds
	secret: "music-lovers-key",		// is this the key used to make the hash?
	name: "spotify-game-with-friends"	// name for cookie
}));

//______________ROUTES______________

//_______HOME_______

// ROOT
app.get("/", function(req, res){
	res.redirect("/index");
});

// INDEX - show "index"
app.get("/index", function(req, res){
	res.render("users/index", {req:req});
});

//_______SIGNUP_______

// SIGNUP - GET "signup"
// show the signup page
app.get("/signup", routeHelper.loggedInStop, function(req, res){
	res.render("users/signup");
});

// SIGNUP - POST "signup"
// create a new user and redirect to "/edit" for user to enter their player bio info
app.post("/signup", function(req, res){
	var newUser = {};
	newUser.email = req.body.userEmail;
	newUser.password = req.body.userPass;
	console.log(newUser);		// this displays password in terminal...ok or no?

	db.User.create(newUser, function(err, user){
		if(err){
			console.log(err);
			//res.redirect("/signup");  // using redirect instead of render because render creates a post request when we don't want one
			res.render("errors/500");
		} else {
			console.log(user);
			req.login(user); // set the session id for this user to be the user's id from our DB
			res.redirect("/users/" + user._id + "/edit");
		}
	});
});

//_______LOGIN_______

// LOGIN - GET "login"
// show the login page
app.get("/login", routeHelper.loggedInStop, function(req, res){
	res.render("users/login");
});

// LOGIN - POST "login"
// sign the user in and redirect to page showing all players "/index"
app.post("/login", function(req, res){
	var userLoggingIn = {};
	userLoggingIn.email = req.body.userEmail;
	userLoggingIn.password = req.body.userPass;
	console.log(userLoggingIn);	

	db.User.authenticate(userLoggingIn, function(err, user){
		if (!err && user !== null){
			req.login(user); // set the session id to the user id for this user
			// res.redirect("/users/" + user_id); // send the user to their own show page
			res.redirect("/users/" + user._id);
		} else {
			console.log(err);
			res.render("users/login", {err:err}); 
// probably want to add some error messaging to login page if error
		}
	});

});

//_______LOGOUT_______
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/index");
});

//_______USER ROUTES_______

// SHOW - GET "show"
// show user's bio, friends, and playlists
app.get("/users/:user_id", routeHelper.ensureSameUser, function(req, res){
	db.User.findById(req.params.user_id, function(err, user){
		if(err){
			console.log(err);
			res.render("errors/500");
		} else {
			res.render("users/show", {user:user});
		}
	});
});

// UPDATE - PUT "edit"
// post updated/edited bio info & redirect to the users/show page
app.put("/users/:user_id", routeHelper.ensureSameUser, function(req, res){

	var userUpdates = {};
	userUpdates.avatarUrl = req.body.userAvatarUrl;
//	userUpdates.genres.push(req.body.userGenres); 
// having trouble updating the genres array here

	db.User.findByIdAndUpdate(req.params.user_id, userUpdates, function(err, user){
		if(err){
			console.log(err);
			res.render("errors/500");
		} else {
			res.redirect("/users/" + user._id);
		}
	});
});

// EDIT - GET "edit"
// show form to edit user's bio
app.get("/users/:user_id/edit", routeHelper.ensureSameUser, function(req, res){
	db.User.findById(req.params.user_id, function(err, user){
		if(err){
			console.log(err);
			res.render("errors/500");
		} else {
			res.render("users/edit", {user:user});
		}
	});
});


//_______PLAYLISTS ROUTES_______

// NEW - GET "new"
// search songs to add to playlist
app.get("/playlists/new", routeHelper.ensureSameUser, function(req, res){
	res.render("playlists/new");
});

// EDIT - GET "edit"
// edit an existing playlist
app.get("/playlists/:playlist_id", routeHelper.ensureSameUser, function(req, res){
	res.render("playlists/edit");
});

// SHOW - POST to users/show
// post updated/edited playlist info & redirect to the user's show page
app.post("playlists/:playlist_id", routeHelper.ensureSameUser, function(req, res){
	// do stuff
	res.redirect("/users/:user_id");
});

//_______ROUNDS ROUTES_______

// PLAY - GET "play" - play computer
app.get("/play/computer", routeHelper.ensureSameUser, function(req, res){
	// do stuff
	res.render("rounds/play");
});

// PLAY - GET "play" - play computer
app.get("/play/:playlist_id", routeHelper.ensureSameUser, function(req, res){
	// do stuff
	res.render("rounds/play");
});

// 404 page - oopsie
app.get("*", function(req, res){
	res.render("errors/404");
});

// _______START SERVER_______
// remote port or localhost
app.listen(process.env.PORT || 3000, function(){
	console.log("Server is starting on port 3000");
});
