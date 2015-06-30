$(function() {

	console.log("viewPlaylists.js file loaded");

// will need to use browserify in order to require modules in this file

	var $showPlaylists = $("#showPlaylists");

	var $spotifyId = $("#spotifyId");
	var destinationId = $spotifyId.val();


	function loadPlaylists(){
		$.getJSON("/users/" + destinationId)
			.done(function(userData, status){
				console.log(userData, "data inside of loadPlaylists getJSON call");
				// console.log(status, "status inside of loadPlaylists getJSON call");

				// display the playlist info on page
				for (var i = 0; i < userData.user.playlistIds.length; i++){
					console.log(userData.user.playlistIds[i].playlistId, "playlistIds");

					currentPlaylist = userData.user.playlistIds[i].playlistId;

					$.getJSON("/playlists/" + currentPlaylist)

						.done(function(playlistData, status){
							console.log(playlistData, "data inside of /playlists/:playlistId call");

							// if (playlistData.playlist.trackIds.length > 0) {
								$showPlaylists.append("<ul><li>Playlist: " + 
								playlistData.playlist.playlistName + 
								"</li><li># of songs: " + playlistData.playlist.trackIds.length +
								"</li><li><a href='/users/" + destinationId + "/play/" + playlistData.playlist.playlistId +"'><button class='button'>Pick Me</button></a></li></ul>");		
							// }
						})
						.fail(function(){
							console.log("error with ajax request to playlist database");
						});
				} // close for loop

			}) // close first .done
			.fail(function(){
				console.log("error with ajax request to user database");
			});
	}


	loadPlaylists();



}); // close $ wrapper