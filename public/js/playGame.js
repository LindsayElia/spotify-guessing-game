$(function() {

	// check that this file is connected to the page we're using it on
	console.log("playGame.js file loaded");

	// temporary list of songs
	var songsArray = ["0eGsygTp906u18L0Oimnem", 
						"5sra5UY6sD658OabHL3QtI", 
						"6qOEjO2IUD7PjtpsXawq0d",
						"5ybJm6GczjQOgTqmJ0BomP", // this one doesn't play anything because the previewUrl is "null"
						"1BeY7Qw9d77wXOqABHpffT",
						"4I3YxhCTk88ClnlBbtDaK0",
						"7DUoFVzdG9bQ2kOmdRjCj9"];

	// global variables
	var currentSong;
	var counter = 0;
	var $startGameForm = $("#startGameForm");
	var $startButton = $("#startButton");
	var $audioPreviewUrl = $("#audioPreviewUrl");
	var $divUserInputGuess = $("#divUserInputGuess");
	var $inputGuessForm = $("#inputGuessForm");
	var $divSongResults = $("#divSongResults");
	var $divScore = $("#divScore");
	var $pSongResults = $("#pSongResults");
	var dataSpotify;
	var $userInputGuess = $("#userInputGuess");

	// hide parts of the page on inital page load
	$divUserInputGuess.hide();
	$divSongResults.hide();
	$divScore.hide();

	// when "start" button/form is clicked, make request and play new song
	$startGameForm.on("submit", function(event){		// why is on.submit not working, but on.click works?
		event.preventDefault();
		console.log("#startGameForm submitted");

		currentSong = songsArray[counter];

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
			dataSpotify = dataRcvd;
			console.log("trying to capture just preview URL: " + dataSpotify.preview_url)
			// put song preview URL in as the source for the audio element

// !!!!
// if dataRcvd.preview_url (dataSpotify) === "null" then tell the player to select a different song for their playlist
// !!!!

			$audioPreviewUrl.attr("src", dataSpotify.preview_url);

			// play the song
			$audioPreviewUrl.on("canplay", function() {
				$audioPreviewUrl[0].play();
			});

			// hide the start button, show the guess form, hide the results from previous answer
			$startGameForm.hide();
			$divUserInputGuess.show();
			$divSongResults.hide();
		})
		.fail(function(){
			console.log("error with ajax request to Spotify API");
		});

		// increase the counter
		counter = counter + 1;

	});

	// on guess submit, do things...
	$inputGuessForm.on("submit", function(event){
		event.preventDefault();
		console.log("#divUserInputGuess submitted");
		$pSongResults.html("<li><img src='" + dataSpotify.album.images[1].url + 
							"' height='" + dataSpotify.album.images[1].height + 
							"' width='" + dataSpotify.album.images[1].width + "'></li>" +
							"<li>Artist: " + dataSpotify.artists[0].name + "</li>" + 
							"<li>Song title: " + dataSpotify.name + "</li>" +
							"<li>Album: " + dataSpotify.album.name + "</li>");

		// stop music from playing
		$audioPreviewUrl[0].pause();

		// hide the guess button, show the song results
		$divUserInputGuess.hide();
		$divSongResults.show();
		$startButton.val("Play again");
		$startGameForm.show();
		
		// check user's guess against song results
		var guessAsIs = $userInputGuess.val();
		var guessLowerCased = guessAsIs.toLowerCase();
		console.log(guessLowerCased);

		var answerArtist = dataSpotify.name;
		var answerSong = dataSpotify.album.name;
		var answer = answerArtist.toLowerCase() + " " + answerSong.toLowerCase();
		console.log(answer);

		var regExp = new RegExp("ab+c");
		


		// update user's score

		// display score
		$divScore.show();

	});




	// store data about song & user's score in our database(s)







}); // close $ wrapper
