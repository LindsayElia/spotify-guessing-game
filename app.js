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

// require and load dotenv - since we only use dotenv here, 
// and don't refer to it, we don't need to set it to a variable, like:
	// var dotenv = require("dotenv");
	// dotenv.load();
require('dotenv').load();

var client_id = process.env.SPOTIFY_CLIENT_ID;
// console.log(client_id, "-- SPOTIFY_CLIENT_ID");
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
// console.log(client_secret, "-- SPOTIFY_CLIENT_SECRET");

// will need to edit this for production:
var redirect_uri = "http://localhost:3000/callback";

// SPOTIFY API REQUIRES THIS
var request = require("request");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

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

// SPOTIFY API REQUIRES THIS
app.use(cookieParser());

/** SPOTIFY API REQUIRES THIS
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';


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

// LOGIN - GET "login" - simple
// show the login page
app.get("/login", routeHelper.loggedInStop, function(req, res){
	res.render("users/login");
});

// LOGIN - POST "login" - simple
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
			res.redirect("/index");
		} else {
			console.log(err);
			res.render("users/login", {err:err}); 
// probably want to add some error messaging to login page if error
		}
	});

});


//_______LOGIN WITH SPOTIFY_______

// SPOTIFY - LOGIN
app.get("/login/spotify", function(req, res){
	
	var state = generateRandomString(16);
 	res.cookie(stateKey, state);

 	// my application requests authorization from Spotify
 	// requesting permission from user to ___ the user's:
 		// read, name & profile image
 		// read, email
 		// read, private playlists
 		// modify, private playlists
 		// read, followers
 		// modify, followers
 		// read, library (tracks only)
	var scope = "user-read-private user-read-email playlist-read-private playlist-modify-private user-follow-read user-follow-modify user-library-read"; 
	res.redirect("https://accounts.spotify.com/authorize?" + querystring.stringify({
		response_type: "code",
		client_id: client_id,
		scope: scope,
		redirect_uri: redirect_uri,
		state: state
	}));

});

// SPOTIFY - RETURN TO MY APP
app.get("/callback", function(req, res){

	// my application requests refresh and access tokens from Spotify
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	// if state is not set, go to 404 (?) page
	if (state === null || state !== storedState) {
		res.redirect("/#" + querystring.stringify({
			error: "state_mismatch"
	}));
	} 
	// if state is set, get tokens
	else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: "https://accounts.spotify.com/api/token",
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: "authorization_code"
		},
			headers: {
				"Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString("base64"))
		},
			json: true
		};

		// make a POST request to the URL in authOptions
		request.post(authOptions, function(error, response, body){
			if (!error && response.statusCode === 200){

				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				var options = {
					url: "https://api.spotify.com/v1/me",
					headers: { "Authorization": "Bearer " + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body){
					console.log(body, "Spotify auth body");

					var spotifyUser = {};
					spotifyUser.name = body.display_name;
					spotifyUser.href = body.href;
					spotifyUser.email = body.email;
					spotifyUser.username = body.id;
					spotifyUser.imageUrl = body.images[0].url;

					console.log(spotifyUser, "spotify user info I captured");

				});

				// we can also pass the token to the browser to make requests from there
				res.redirect("/#" + querystring.stringify({
					access_token: access_token,
					refresh_token: refresh_token
				}));
				} else {
					res.redirect("/#" + querystring.stringify({
						error: "invalid_token"
				}));
				}
		});
	}
});

// SPOTIFY - GET NEW TOKENS
app.get('/refresh_token', function(req, res){

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: "https://accounts.spotify.com/api/token",
		headers: { "Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString("base64")) },
		form: {
			grant_type: "refresh_token",
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function(error, response, body){
		if (!error && response.statusCode === 200){
			var access_token = body.access_token;
			res.send({
				"access_token": access_token
			});
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
