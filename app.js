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

// _______EDIT LATER_______
// will need to edit this for production:
var redirect_uri = "http://localhost:3000/callback";


// SPOTIFY API REQUIRES THIS
var request = require("request");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

// module request-wrapper for Spotify API
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

/** SPOTIFY API REQUIRES THIS??
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

	// if state is not set, go to 404 page
	if (state === null || state !== storedState) {
		res.redirect("/404" + querystring.stringify({error: "state_mismatch"}));
	} 
	
	// if state is set, get tokens
	else {
		res.clearCookie(stateKey);

		// make a POST request with the token
		var authOptions = { 
							url: "https://accounts.spotify.com/api/token", 
							form: { code: code, redirect_uri: redirect_uri, grant_type: "authorization_code" },
							headers: {"Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString("base64"))},
							json: true
						  };
		
		request.post(authOptions, function(error, response, body){
			if (!error && response.statusCode === 200){

				var access_token = body.access_token;
				var refresh_token = body.refresh_token;
				var options = {
								url: "https://api.spotify.com/v1/me",
								headers: { "Authorization": "Bearer " + access_token },
								json: true
							  };

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, userBody){
					// console.log(userBody, "Spotify auth body");
					var spotifyUser = {};
					spotifyUser.spotifyId = userBody.id;
					spotifyUser.fullName = userBody.display_name;
					spotifyUser.email = userBody.email;
					spotifyUser.userUrl = userBody.href;
					spotifyUser.imageUrl = userBody.images[0].url;
					spotifyUser.accessToken = access_token;

					// console.log(spotifyUser, "spotify user info I captured");

					// findOneAndUpdate creates item(document) in database if it does not exist,
					// and if it does exist, it updates the fields I'm adding here with the current
					// ones I'm grabbing from the Spotify API
					db.User.findOneAndUpdate({spotifyId:spotifyUser.spotifyId}, spotifyUser, {new:true, upsert:true}, function(err, user){
							console.log("request.get to spotify and findOneAndUpdate is running");
							if(err){ 
									console.log(err, "error saving user to database by SpotifyId");
									res.redirect("/errors/500?" + querystring.stringify({error: "invalid_token"}));
							} else { 

									req.login(access_token); // set the session id to the Spotify access_token for this user
									// console.log(user, "user in our db now, from inside findOneAndUpdate");
									// console.log(access_token, "access_token from inside findOneAndUpdate");
									// console.log(user.accessToken, "user accessToken from inside findOneAndUpdate");
									var queryVar = querystring.stringify({ access_token: access_token, refresh_token: refresh_token, display_name: body.display_name, spotifyId: body.id });
									console.log(queryVar, "queryVar");
									res.redirect("/users/redirect?" + queryVar);
							}


							// get playlist info for this user
							var optionsPlaylist = {
											url: "https://api.spotify.com/v1/users/" + spotifyUser.spotifyId + "/playlists",
											headers: { "Authorization": "Bearer " + access_token },
											json: true
							};

							
							spotifyUser.playlistIds = [];

							// save each playlist Id into an array on the spotifyUser model
							request.get(optionsPlaylist, function(error, response, playlistBody){

								for(var i = 0; i < playlistBody.items.length; i++){

									spotifyUser.playlistIds.push(playlistBody.items[i].id);
									// console.log(spotifyUser.playlistIds, "playlistsIds for current user");

									// update the user in the user database with the playlistIds array	
									db.User.findOneAndUpdate({spotifyId:spotifyUser.spotifyId}, spotifyUser, {new:true, upsert:true}, function(err, user){
										if(err){
											console.log(err, "error saving playlists to user database");
										} else {
											console.log("playlists saved to user database");
											console.log(spotifyUser, "this is the user data being saved/updated");
										}
									});	


									// save each track Id into an array on the playlist model
									var optionsPlaylistTrack = {
										url: "https://api.spotify.com/v1/users/" + spotifyUser.spotifyId + "/playlists/" + playlistBody.items[i].id + "/tracks",
										headers: { "Authorization": "Bearer " + access_token },
										json: true,
										fields: "items(track(name,href,album(name,href)))"
									};

									var spotifyPlaylist = {};
									spotifyPlaylist.playlistId = playlistBody.items[i].id;
									spotifyPlaylist.trackIds = [];

									// find all songs in playlist & save to trackIds array for that playlist
									request.get(optionsPlaylistTrack, function(error, response, trackBody){
										console.log(trackBody.items, "trackBody response from playlist tracks option");
										// if playlist is empty, do nothing, otherwise save tracks in trackIds array
											for (var t = 0; t < trackBody.items.length; t++){
												if (trackBody.items !== []){
													spotifyPlaylist.trackIds.push(trackBody.items[t].track.id);
													console.log(spotifyPlaylist.trackIds, "this trackId");
												}
											}
										
										// add/update the playlist in the playlist database with the tracksId array
										db.Playlist.findOneAndUpdate({playlistIds:spotifyPlaylist.playlistId}, spotifyPlaylist, {new:true, upsert:true}, function(err, playlist){
											if(err){
												console.log(err, "error saving tracksId to playlist database");
											} else {
												console.log("tracks saved to playlist database");
												console.log(spotifyPlaylist, "this is the spotifyPlaylist being saved/updated");
											}
										});

									});	

								}

							});			

					});		

				});
				
			}
		});

	}
});


// SPOTIFY - GET NEW TOKENS
// app.get('/refresh_token', function(req, res){

// 	// requesting access token from refresh token
// 	var refresh_token = req.query.refresh_token;
// 	var authOptions = {
// 		url: "https://accounts.spotify.com/api/token",
// 		headers: { "Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString("base64")) },
// 		form: {
// 			grant_type: "refresh_token",
// 			refresh_token: refresh_token
// 		},
// 		json: true
// 	};

// 	request.post(authOptions, function(error, response, body){
// 		if (!error && response.statusCode === 200){
// 			var access_token = body.access_token;
// 			res.send({
// 				"access_token": access_token
// 			});
// 		}
// 	});

// });



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
