$(function() {

	console.log("viewSongs.js file loaded");

// will need to use browserify in order to require modules in this file

	// var $showPlaylists = $("#showPlaylists");

	var $spotifyId = $("#spotifyId");
	var destinationId = $spotifyId.val();

	var $playlistId = $("#playlistId");
	var currentPlaylist = $playlistId.val();

	var $divSongResults = $("#divSongResults");


	// var currentTracksArr = [];

	function loadTracks(){
		$.getJSON("/users/" + destinationId + "/play/" + currentPlaylist)
			.done(function(songData, status){
				console.log(songData, "data inside of loadTracks getJSON call");

				var tracksArr = songData.playlist.trackIds;
				console.log(tracksArr, "tracksArr");

				for (var i = 0; i < tracksArr.length; i++ ) {
					var thisTrackId = tracksArr[i].trackId;
					// console.log(thisTrackId, "thisTrackId");
					// currentTracksArr.push(thisTrackId);

					getAllTrackData(thisTrackId);

					$divSongResults.append("<ul><li>" + thisTrackId +
										"<li>" + fullTrackData + "</li>" +
										"</li></ul>");


				}
				// console.log(currentTracksArr, "currentTracksArr");



				return currentTracksArr;
			})
			.fail(function(){
				console.log("error with ajax request to get/playlist route");
			});
	} // close loadTracks()

	
	function getAllTrackData(thisTrackId){
		$.getJSON("/play/" + currentPlaylist + "/track/" + thisTrackId)
			.done(function(fullTrackData, status){
				console.log(fullTrackData, "fullTrackData");
			})
			.fail(function(){
				console.log("error with ajax request to get play/currentPlaylist/track/thisTrackId route");
			});
	} // close getAllTrackData()

	loadTracks();

	// console.log(currentTracksArr, "currentTracksArr");

}); // close $ wrapper