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

// SPOTIFY API REQUIRES THIS
var request = require("request");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

// module spotify-web-api-node for Spotify API
var SpotifyWebApi = require('spotify-web-api-node');


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


//______________GET AUTHORIZATION FROM SPOTIFY______________

// require and load dotenv - we don't need to set it to a variable
require('dotenv').load();

var client_id = process.env.SPOTIFY_CLIENT_ID;
// console.log(client_id, "-- SPOTIFY_CLIENT_ID");
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
// console.log(client_secret, "-- SPOTIFY_CLIENT_SECRET");

// _______EDIT LATER_______
// will need to edit this for production:
var redirect_uri = "http://localhost:3000/callback";


// Generates a random string containing numbers and letters
var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';

var authorizationCode;

// ROUTES FOR GETTING AN ACCESS TOKEN / CODE / authorizationCode FROM SPOTIFY

app.get('/login/spotify', function(req, res) {
	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = "user-read-private user-read-email playlist-read-private playlist-modify-private user-follow-read user-follow-modify user-library-read";
	res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
		response_type: 'code',
		client_id: client_id,
		scope: scope,
		redirect_uri: redirect_uri,
		state: state
    }));
});


app.get('/callback', function(req, res) {


	// my application requests refresh and access tokens
	// after checking the state parameter

	authorizationCode = req.query.code || null;
	console.log("special code", authorizationCode);
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;


	if (state === null || state !== storedState) {
		res.redirect('/404' +
		querystring.stringify({
			error: 'state_mismatch'
		}));
	} else {

	    	res.clearCookie(stateKey);

	    	var authOptions = {
				url: 'https://accounts.spotify.com/api/token',
				form: {
					code: authorizationCode,
	  				redirect_uri: redirect_uri,
					grant_type: 'authorization_code'
				},
				headers: {
					'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
				},
				json: true
	   			};


    		request.post(authOptions, function(error, response, body) {
				if (!error && response.statusCode === 200) {

			        var access_token = body.access_token;
			        console.log("access token!!! : ", access_token);
					var refresh_token = body.refresh_token;
			        var options = {
				        	url: 'https://api.spotify.com/v1/me',
				        	headers: { 'Authorization': 'Bearer ' + access_token },
				        	json: true
			        		};

			        // use the access token to access the Spotify Web API
			        request.get(options, function(error, response, body) {
			        	console.log(body);

			        	var spotifyUser = {};
			        	spotifyUser.spotifyId = body.id;
			        	console.log("spotify user id: ", spotifyUser.spotifyId);
			        	spotifyUser.accessToken = access_token;

// add more properties to user here once I get this working again

			        	db.User.findOneAndUpdate({spotifyId:spotifyUser.spotifyId}, spotifyUser, {new: true, upsert: true}, function(err, user){
			        		if(err){
			        			console.log("error saving user to database on callback from API", err);
			        			res.redirect("/errors/500?" + querystring.stringify({error:"invalid_token"}));
			        		} else {

			        			req.login(access_token);
			        			res.redirect('/users/redirect?' +
			        							querystring.stringify({
			        								access_token: access_token,
			        								refresh_token: refresh_token,
			        								display_name: body.display_name, 
			        								spotifyId: body.id
			        						}));
			        		}
			        	});


			        });
			  
				}
				
			});

	} // close first 'if'

});

// save my credentials to the spotify-web-api-node wrapper object
var spotifyApi = new SpotifyWebApi({
	clientId : client_id,
	clientSecret : client_secret,
	redirectUri : redirect_uri,
});

spotifyApi.authorizationCodeGrant(authorizationCode)
	.then(function(data){
		console.log("Retrieved access token: ", data.body["access_token"]);

		// set the access token

	});



//______________ROUTES______________


app.get("/welcom", function(req, res){
	res.render("users/welcome");
});

//_______HOME_______

// ROOT
app.get("/", function(req, res){
	res.redirect("/index");
});

// INDEX - show "index"
app.get("/index", function(req, res){
	res.render("users/index", {req:req});
});

app.get("/index/:spotifyId", function(req, res){
	db.User.findOne({spotifyId:req.params.spotifyId}, function(err, user){
		if(err){
			console.log(err, "error in getting /users/:spotifyId route");
			res.render("errors/500");
		} else {
			res.render("users/index", {req:req});
		}
	});
});

//_______LOGOUT_______
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/index");
});

//_______USER ROUTES_______


app.get("/users/redirect", routeHelper.ensureSameSpotifyUser, function(req, res){
		res.redirect("/users/" + req.query.spotifyId);
});


// SHOW - GET "show"
// show user's bio, friends, and playlists
app.get("/users/:spotifyId", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	db.User.findOne({spotifyId:req.params.spotifyId}, function(err, user){
		// console.log("get /users findOne is running");
		if(err){
			console.log(err, "error in getting /users/:user_id route");
			res.render("errors/500");
		} else {
			res.format({
				"text/html": function(){
					res.render("users/show", {user:user});
				},
				"application/json": function(){
					res.send({user:user});
				},
				"default": function(){
					res.status(406).send("Not an acceptable format for this page");
				}
			});
		}		
	});
});

// UPDATE - PUT "edit"
// post updated/edited bio info & redirect to the users/show page
// app.put("/users/:user_id", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){

// 	var userUpdates = {};
// 	userUpdates.avatarUrl = req.body.userAvatarUrl;
// //	userUpdates.genres.push(req.body.userGenres); 
// // having trouble updating the genres array here

// 	db.User.findByIdAndUpdate(req.params.user_id, userUpdates, function(err, user){
// 		if(err){
// 			console.log(err);
// 			res.render("errors/500");
// 		} else {
// 			res.redirect("/users/" + user._id);
// 		}
// 	});
// });

// EDIT - GET "edit"
// show form to edit user's bio
app.get("/users/:spotifyId/edit", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	db.User.findOne({spotifyId:req.params.spotifyId}, function(err, user){
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
app.get("/playlists/new", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	res.render("playlists/new");
});

// EDIT - GET "edit"
// edit an existing playlist
app.get("/playlists/:playlist_id", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	res.render("playlists/edit");
});

// SHOW - POST to users/show
// post updated/edited playlist info & redirect to the user's show page
app.post("playlists/:playlist_id", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	// do stuff
	res.redirect("/users/:user_id");
});

//_______ROUNDS ROUTES_______

// PLAY - GET "play" - play computer
app.get("/play/computer", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	// do stuff
	res.render("rounds/play");
});

// PLAY - GET "play" - play computer
app.get("/play/:playlist_id", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	// do stuff
	res.render("rounds/play");
});

// 500 page - oopsie
app.get("/errors/500", function(req, res){
	console.log("in the /errors/500 - oopsie route");
	res.render("errors/500");
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
