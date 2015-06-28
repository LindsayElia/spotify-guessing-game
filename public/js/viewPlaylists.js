$(function() {

	console.log("viewPlaylists.js file loaded");

// only need this (below) if making requests to spotify API directly from this file
// will need to use browserify in order for dotenv to load into this file

	// require('dotenv').load();
	// load the spotifyApit module
	// any other modules needed?

	// 	var client_id = process.env.SPOTIFY_CLIENT_ID;
	// 	// console.log(client_id, "-- SPOTIFY_CLIENT_ID");
	// 	var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
	// 	// console.log(client_secret, "-- SPOTIFY_CLIENT_SECRET");
	// // _______EDIT LATER_______
	// 	// will need to edit this for production:
	// 	var redirect_uri = "http://localhost:3000/callback";

	// // get the user's access token out of my database
	// var userAccessToken;
	// db.User.findOne({spotifyId:$spotifyId}, function(err, user){
	// 	userAccessToken = user.accessToken;
	// 	console.log("access token retrieved from my database", userAccessToken);
	// 	return userAccessToken;
	// });

	// // save my credentials to the spotify-web-api-node wrapper object
	// var spotifyApi = new SpotifyWebApi({
	// 	clientId : client_id,
	// 	clientSecret : client_secret,
	// 	redirectUri : redirect_uri,
	// 	accessToken : userAccessToken
	// });

	// spotifyApi.getMe()
	// 	.then(function(data){
	// 		console.log("info about the authenticated user: ", data.body);
	// 	}), function(err){
	// 		console.log("something went wrong with getMe: ", err);
	// 	};

	var $showPlaylists = $("#showPlaylists");

	var $spotifyId = $("#spotifyId");
	var destinationId = $spotifyId.val();




	// function loadPlaylists(){
	// 	$.getJSON("/users/" + destinationId)
	// 		.done(function(data, status){
	// 			// console.log(data, "data inside of loadPlaylists getJSON call");
	// 			// console.log(status, "status inside of loadPlaylists getJSON call");
				
	// 			for (var i = 0; i < data.user.playlistIds.length; i++){
	// 				// console.log(data.user.playlistIds[i], "playlistIds");
	// 				$showFriends.append("<li>Playlist: " + data.user.playlistIds[i] + "</li>");
	// 			}

	// 		})
	// 		.fail(function(){
	// 			console.log("error with ajax request to my database");
	// 		});
	// }


	// loadPlaylists();



}); // close $ wrapper