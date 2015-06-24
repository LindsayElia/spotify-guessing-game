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
	var $countdown = $("#countdown");
	var $divSongResults = $("#divSongResults");
	var $divScore = $("#divScore");
	var $pSongResults = $("#pSongResults");
	var dataSpotify;
	var $userInputGuess = $("#userInputGuess");
	var scoreCorrect = 0;
	var scoreIncorrect = 0;


	// hide parts of the page on inital page load
	$divUserInputGuess.hide();
	$divSongResults.hide();
	$divScore.hide();
	$countdown.hide()

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
			$countdown.show();
			$divSongResults.hide();
			$divScore.hide();
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
		$countdown.hide();
		
		// check user's guess against song results
		var guessAsIs = $userInputGuess.val();
		var guessLowerCased = guessAsIs.toLowerCase();
		console.log("guessLowerCased is " + guessLowerCased);

		var answerArtist = dataSpotify.artists[0].name;
		var answerSong = dataSpotify.name;
		var answer = answerArtist.toLowerCase() + " " + answerSong.toLowerCase();
		console.log("var answer is " + answer);

		// NOTE - I tried using regular expressions with match() but it had to match the entire string??
			// var regExp = new RegExp(answer);
			// console.log("regExp is " + regExp);
			// var isMatch = guessLowerCased.match(regExp);
			// console.log("var isMatch is " + isMatch);
			// if (isMatch && isMatch.length > 0){
			// 	console.log("match - true");
			// 	return true;
			// } else {
			// 	console.log("match - false");
			// 	return false;
			// }

		// when a user does not type anything or only types one character, return wrong answer
		if (guessLowerCased <=1){
			console.log("answer is incorrect");
			scoreIncorrect = scoreIncorrect + 1;
			
		} 
		// if answer includes guess, return correct answer
		// using .includes() here which is "experimental" according to MDN but seems to work!
		else if (answer.includes(guessLowerCased)){
			console.log("answer is correct!!");
			scoreCorrect = scoreCorrect + 1;
		} 
		// otherwise, return wrong answer
		else {
			console.log("answer is incorrect");
			scoreIncorrect = scoreIncorrect + 1;
		}

		


		// update user's score

		// display score
		$divScore.show();

	});




	// store data about song & user's score in our database(s)







}); // close $ wrapper
