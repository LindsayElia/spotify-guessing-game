$(function() {

	console.log("viewSongs.js file loaded");

// will need to use browserify in order to require modules in this file

	// var $showPlaylists = $("#showPlaylists");

	var $spotifyId = $("#spotifyId");
	var destinationId = $spotifyId.val();

	var $playlistId = $("#playlistId");
	var currentPlaylist = $playlistId.val();

	function loadTracks(){
		$.getJSON("/users/" + destinationId + "/play/" + currentPlaylist)
			.done(function(songData, status){
				console.log(songData, "data inside of loadTracks getJSON call");

			})
			.fail(function(){
				console.log("error with ajax request to get/playlist route");
			});
	} // close loadTracks()

	loadTracks();

}); // close $ wrapper