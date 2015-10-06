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
console.log(typeof SpotifyWebApi, " -- type of SpotifyWebApi");

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

// GLOBAL VARIABLE(S)
var spotifyUserId;

//______________GET AUTHORIZATION FROM SPOTIFY______________

// require and load dotenv - we don't need to set it to a variable
require('dotenv').load();

var client_id = process.env.SPOTIFY_CLIENT_ID;
console.log(client_id, "-- SPOTIFY_CLIENT_ID first time");
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
// console.log(client_secret, "-- SPOTIFY_CLIENT_SECRET");


// _______EDIT THIS BEFORE DEPLOYING TO HEROKU/PRODUCTION_______
// _______EDIT THIS BEFORE DEPLOYING TO HEROKU/PRODUCTION_______
// _______EDIT THIS BEFORE DEPLOYING TO HEROKU/PRODUCTION_______

// will need to edit this for production:
// var redirect_uri = "http://localhost:3000/callback";		// development URL
var redirect_uri = "https://spotify-guessing-game.herokuapp.com/callback"; // production URL


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
    console.log(client_id, "-- SPOTIFY_CLIENT_ID second time");
    console.log(querystring.stringify, "-- querystring querystring querystring");
});


// ON RETURN, GET ALL THE DATA FROM THE API AND STORE IT IN MY DATABASES

app.get('/callback', function(req, res) {


	// my application requests refresh and access tokens
	// after checking the state parameter

	var authorizationCode = req.query.code || null;
	// console.log("special code", authorizationCode);
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;
	console.log("storedState: ", storedState);

	if (state === null || state !== storedState) {
		res.redirect('/404' +
		querystring.stringify({
			error: 'state_mismatch'
		}));
	} 
	else {

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
			        // console.log("access token!!! : ", access_token);
					var refresh_token = body.refresh_token;
			        var options = {
				        	url: 'https://api.spotify.com/v1/me',
				        	headers: { 'Authorization': 'Bearer ' + access_token },
				        	json: true
			        		};

					// use the access token to access the Spotify Web API

					// save my credentials to the spotify-web-api-node wrapper object
					// so we can use it instead of request.get
					// since it has promises like .then() etc
					var spotifyApi = new SpotifyWebApi({
						clientId : client_id,
						clientSecret : client_secret,
						redirectUri : redirect_uri,
						accessToken : access_token
					});		        

// start the request for data from Spotify API

			        // make a request to Spotify API to get data for current user
			        spotifyApi.getMe()
			        	.then(function(data){
			        		console.log("user data returned from spotify: >>> ", data);
			        		return data;
			        	})
			        	.then(function(data){
// format the data how we want it, for saving in our db
			        		// console.log("body of request to https://api.spotify.com/v1/me: ", data.body);

			        		// assign the API body response for the user to the user object we'll save
				        	// into our database
				        	var spotifyUser = {};
				        	spotifyUser.spotifyId = data.body.id;
				        	console.log("spotify user id: ", spotifyUser.spotifyId);
				        	spotifyUser.accessToken = access_token;
				        	spotifyUser.fullName = data.body.display_name;
				        	spotifyUser.email = data.body.email;
				        	spotifyUser.userUrl = data.body.href;
				        	// spotifyUserimageUrl = data.body.images[0].url;
				        	console.log("logging ?? for ??");
				        	console.log("data.body.images: ", data.body.images);
				        	console.log("data.body.images[0]: ", data.body.images[0]);

				        	if(data.body.images[0] === undefined){
				        		spotifyUser.userImageUrl = null;
				        		console.log("logging 1 for null");
				        	} else {
				        		spotifyUser.userImageUrl = data.body.images[0].url;
				        		console.log("logging 2 for image url");
				        	}
				        	return spotifyUser;
				        })
				        .then(function(spotifyUser){
// save user in user database and redirect user to load their show page
							// redirect to to /users/redirect?querystring...
				        	db.User.findOneAndUpdate({spotifyId:spotifyUserId}, spotifyUser, {new: true, upsert: true}, function(err, user){
				        		if(err){
				        			console.log("error saving user to database on callback from API", err.message);
				        			res.redirect("/errors/500?" + querystring.stringify({error:"invalid_token"}));
				        		} else {
				        			// set user cookie to be access token and redirect user to user's show page
				        			req.login(access_token);
				        			res.redirect('/users/redirect?' +
				        							querystring.stringify({
				        								access_token: access_token,
				        								refresh_token: refresh_token,
				        								display_name: body.display_name, 
				        								spotifyId: spotifyUser.spotifyId
				        						}));
				        		}
				        	}); // close db.User.findOneAndUpdate...;

// set the global variable of spotify user id to be what the Spotify API returns to us
				        	spotifyUserId = spotifyUser.spotifyId;
				        	return spotifyUserId;
			        	})
						.then(function(){
// get playlists for current user
							// console.log("getting playlists for current user");
				        	var playlistData = spotifyApi.getUserPlaylists(spotifyUserId, {limit:50});
				        	return playlistData;
						})
						.then(function(playlistData){		
							// playlistData is set to whatever is returned from previous section,
							// it doesn't matter what we call it in the previous section
							// each of these sections, or promises, takes in the result of the previous one
							// so it doesn't matter what is after the 'return' in the previous one, it's
							// just for readability

// format the playlist data how we want it, for saving in our playlist db
							// console.log("all playist data: -- items ", playlistData.body.items);

							var playlistsArray = [];
							for (var i = 0; i < playlistData.body.items.length; i++){
								playlistsArray.push({
									playlistId: playlistData.body.items[i].id,		// spotify id for playlist
									playlistName: playlistData.body.items[i].name 	// playlist's name
									});
								// console.log("user id + playlists now in playlistsArray array: ", playlistsArray);
							}
							return playlistsArray;
						})
						.then(function(playlistsArray){
// save playlists in user database, as an array on the user model
							// console.log("showing playlistsArray we want to save to the user db: ", playlistsArray);
							var user = {};
							user.playlistIds = playlistsArray;
							// console.log("this is the user.playlistIds as an array being saved to the user db: ", user.playlistIds);
							
							// save playlist Ids to user in user database (both playlist ids and names)
							db.User.findOneAndUpdate({spotifyId:spotifyUserId}, user, {new: true, upsert: true}, function(err, user){
								if(err){
									console.log("error saving playlists array to user: ", err.message);
								} else {
									// console.log("user object: ", user);
									console.log("playlist ids added to user - success");
								}
							}); // close db.User.findOneAndUpdate...
							return playlistsArray;
						})
						.then(function(playlistsArray){
// save playlists in playlist database
							// for each item in playlistsArray, save its playlistId and playlistName
							for (var i = 0; i < playlistsArray.length; i++){
								var playlist = {};
								playlist.playlistId = playlistsArray[i].playlistId;
								playlist.playlistName = playlistsArray[i].playlistName;
								// console.log("playlist trying to save id and name: ", playlist);
								db.Playlist.findOneAndUpdate({playlistId:playlist.playlistId}, playlist, {new: true, upsert: true}, function(err, playlist){
										if(err){
											console.log("error saving playlist to playlists database - ", err.message);
										} else {
											// console.log("playlist saved to playlist database: ", playlist);
											console.log("playlist ids saved to playlist database - success");
										}
								}); // close db.Playlist.findOneAndUpdate...
							} // close for loop
							return playlistsArray;
						})
						.then(function(playlistsArray){

// get tracks for all playlists we just got from the API for current user
							return playlistsArray.forEach(function(playlist){
								var playlistArrayForTracks = [];	// array containing just the song names and song ids
								var trackInfo;						// track info for each song in playlist, only song name and song id
								var trackInfoAll;					// track info for each song in playlist, all song info

								// get track info for all tracks
								spotifyApi.getPlaylistTracks(spotifyUserId, playlist.playlistId, {limit:100}, function(err, data){
									if(err){
										console.log("something went wrong in playlistsArray.forEach / spotifyApi.getPlaylistTracks - error message is: ", err.message);	
									}
									
									else if (data.body.total !== 0) {
										console.log("tracks were found in spotify api for this playlist for playlist");
// for each song...
										    for(var t = 0; t < data.body.items.length; t++){
// ...first, save just the track name and track id to an object
	// to be saved in playlists database
	// which we do later, below, just outside of this for loop
										    	trackInfo = {
										    		title: data.body.items[t].track.name,
										    		trackId: data.body.items[t].track.id,
										    	};

												playlistArrayForTracks.push(trackInfo);
												// console.log("playlistArrayForTracks containing trackInfo: >>>", playlistArrayForTracks);
// ...second, save all track info to an object
	// to be saved in tracks database				
												// console.log("track data returned as json >>> ", data.body.items[t]);
												// console.log("artwork URL >>> ", data.body.items[t].track.album.images[1].url);
												// console.log("looking for preview URL >>> ", data.body.items[t].track.disc_number);
												// console.log("mystery track id >>> ", data.body.items[t].track.id);
										     	trackInfoAll = {
										     		trackId: data.body.items[t].track.id,
										     		title: data.body.items[t].track.name,
										     		artist: data.body.items[t].track.artists, //this is an array
										     		album: data.body.items[t].track.album.name,
										     		artworkUrl: data.body.items[t].track.album.images[1].url,
										     		previewUrl: data.body.items[t].track.preview_url,
										     		fullSpotifyUrl: data.body.items[t].track.external_urls.spotify
										     	};
// ...third, save all track info to the tracks database
												db.Track.findOneAndUpdate({trackId:trackInfoAll.trackId}, trackInfoAll, {new: true, upsert: true}, function(err, track){
													if(err){
														console.log("error saving trackInfoAll to tracks database - ", err.message);
													} else {
														// console.log("trackInfoAll saved to tracks database - ", trackInfoAll);
														console.log("trackInfoAll saved to tracks database - success");
													}
												}); // close db.Playlist.findOneAndUpdate...for Tracks

										    } // close for loop
											
// save track names and track ids in the playlists database for each playlist id
// doing this outside of the for loop because I can save the whole
// array at once, to the trackIds value in the playlist model
											var playlistTracksArray = {};
											playlistTracksArray.trackTitlesAndIds = playlistArrayForTracks;	// set the array containing all tracks to the array in the playlist model referencing the list of tracks
											db.Playlist.findOneAndUpdate({playlistId:playlist.playlistId}, playlistTracksArray, {new: true, upsert: true}, function(err, playlist){
													if(err){
														console.log("error saving playlistTracksArray to playlists database - ", err.message);
													} else {
														// console.log("playlistTracks saved to playlists database: ", playlistTracks);
														console.log("playlistTracksArray saved to playlist database - success");	
													}
											}); // close db.Playlist.findOneAndUpdate...for Playlists


									} // close else if
										
								}); // close spotifyApi.getPlaylistTracks...

							}); // close playlistIds.forEach(...

						}) // close previous .then()
			        	.catch(function(err){	// catch-all error message if anything goes wrong for this giant promises call!
			        		console.log("something went wrong in .catch - error message is: ", err.message);	
			        	}); // close spotifyApi.getMe()

				} // close if (!error...)
				
			}); // close request.post(authOptions...)

	} // close 'else'

}); // close app.get "/callback"




//______________ROUTES______________


//_______PUBLIC_______

// ROOT
app.get("/", function(req, res){
	res.redirect("/index");
});

// INDEX - show "index"
app.get("/index", function(req, res){
	res.render("users/index", {req:req});
});

// LOGOUT
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/index");
});


//_______USER ROUTES_______

// after user logs in, redirect them to their show page with their info in the query
app.get("/users/redirect", routeHelper.ensureSameSpotifyUser, function(req, res){
		res.redirect("/users/" + req.query.spotifyId);
});

// SHOW - GET "show"
// show user's bio, friends, and playlists
app.get("/users/:spotifyId", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	db.User.findOne({spotifyId:req.params.spotifyId}, function(err, user){
		console.log("get /users findOne is running");
		console.log("user data for this user is...", user);
		console.log("user data in playlists array...", user.playlistIds);
		if(err){
			console.log(err, "error in getting /users/:spotifyId route");
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


//_______PLAYLISTS ROUTES_______

// SHOW playlist info
app.get("/playlists/:playlistId", function(req, res){
	db.Playlist.findOne({playlistId:req.params.playlistId}, function(err, playlist){
		if(err){
			console.log(err, "error in getting /playlists/:playlistId route");
			res.render("errors/500");
		} else {
			res.format({
				"text/html": function(){
					res.render("users/show", {playlist:playlist});
				},
				"application/json": function(){
					res.send({playlist:playlist});
				},
				"default": function(){
					res.status(406).send("Not an acceptable format for this page");
				}
			});
		}
	});
});

//_______PLAY GAME ROUTES_______

// PLAY - GET "play" for current user and current playlist
app.get("/users/:spotifyId/play/:playlistId", routeHelper.ensureSameSpotifyUserLoggedIn, function(req, res){
	console.log("getting /users/:spotifyId/play/:playlistId");
	// find this user & load into page
	db.User.findOne({spotifyId:req.params.spotifyId}, function(err, user){
		if(err){
			console.log(err, "error in getting /users/:spotifyId/play/:playlistId, user DB");
			res.render("errors/500");
		} else {
			// find tracks for this playlist & load into page
			db.Playlist.findOne({playlistId:req.params.playlistId}, function(err, playlist){
				if(err){
					console.log(err, "error in getting /users/:spotifyId/play/:playlistId route, playlist DB");
					res.render("errors/500");
				} else {
					// render the page / send info to our frontend js file(s)
					res.format({
						"text/html": function(){
						// grab track info out of our db when we load this page
							res.render("rounds/play", {user:user, playlist:playlist});
						},
						"application/json": function(){
							res.send({playlist:playlist});
						},
						"default": function(){
							res.status(406).send("Not an acceptable format for this page");
						}
					}); // close res.format
				} // close else
			}); // close db.Playlist.findOne
		} // close else
	}); //close db.User.findOne
}); // close app.get

// SHOW track info
// get /track/ + thisTrackId
app.get("/track/:trackId", function(req, res){
	db.Track.findOne({trackId:req.params.trackId}, function(err, track){
		if(err){
			console.log(err, "error in getting /play/:playlistId/track/:trackIdplaylistId route");
			res.render("errors/500");
		} else {
			res.format({
				"text/html": function(){
					res.render("rounds/play", {track:track});
				},
				"application/json": function(){
					res.send({track:track});
				},
				"default": function(){
					res.status(406).send("Not an acceptable format for this page");
				}
			});
		}
	});
});

//_______ERRORS_______

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
