$(function() {

	console.log("findFriends.js file loaded");

	var $showFriends = $("#showFriends");
	$showFriends.html("<h1>Friends!!</h1>");

	var $showPlaylists = $("#showPlaylists");

	var $spotifyId = $("#spotifyId");
	var destinationId = $spotifyId.val();


	function loadPlaylists(){
		$.getJSON("/users/" + destinationId)
			.done(function(data, status){
				// console.log(data, "data inside of loadPlaylists getJSON call");
				// console.log(status, "status inside of loadPlaylists getJSON call");
				
				for (var i = 0; i < data.user.playlistIds.length; i++){
					// console.log(data.user.playlistIds[i], "playlistIds");
					$showFriends.append("<li>Playlist: " + data.user.playlistIds[i] + "</li>");
				}

			})
			.fail(function(){
				console.log("error with ajax request to my database");
			});
	}


	loadPlaylists();

}); // close $ wrapper