$(function() {

	console.log("playGame.js file loaded");

	var songsArray = ["0eGsygTp906u18L0Oimnem", 
						"5sra5UY6sD658OabHL3QtI", 
						"6qOEjO2IUD7PjtpsXawq0d", 
						"5ybJm6GczjQOgTqmJ0BomP"]


	var currentSong;

	var $startGameForm = $("#startGameForm");
	$startGameForm.on("submit", function(event){
		event.preventDefault();
		console.log("#startGameForm submitted");

		currentSong = songsArray[0];

		var $audioPreviewUrl = $("#audioPreviewUrl");
		console.log($audioPreviewUrl.attr("src"));
		
		//$audioPreviewUrl.attr("src", newURL goes here));
		
		// make request to Spotify API
		// get song preview URL by track #
		$.ajax({
			method: "GET",
			url: "https://api.spotify.com/v1/tracks/" + currentSong,
		})
		.done(function(dataRcvd, status){
			console.log(status);
			console.log(dataRcvd);
			console.log("trying to capture just preview URL: " + dataRcvd.preview_url)
			// put song preview URL in as the source for the audio element
			

		})
		.fail(function(){
			console.log("error with ajax request to Spotify API");
		});



	})

	// show/hide song info


	// store data about song & user's score in our database(s)







}); // close $ wrapper
