$(function() {

	// check that this file is connected to the page we're using it on
	console.log("playGame.js file loaded");

	// load song tracks into this file as an array
	var $spotifyId = $("#spotifyId");
	var destinationId = $spotifyId.val();

	var $playlistId = $("#playlistId");
	var currentPlaylist = $playlistId.val();

	var $divSongResults = $("#divSongResults");


	var songsArray = [];

	// temporary list of songs - this is hard-coded and now replaced with the songs loaded by loadTracks()
	// var songsArray = ["0eGsygTp906u18L0Oimnem", 
	// 					"5sra5UY6sD658OabHL3QtI", 
	// 					"6qOEjO2IUD7PjtpsXawq0d",
	// 					"5ybJm6GczjQOgTqmJ0BomP", // this one doesn't play anything because the previewUrl is "null"
	// 					"1BeY7Qw9d77wXOqABHpffT",
	// 					"4I3YxhCTk88ClnlBbtDaK0",
	// 					"7DUoFVzdG9bQ2kOmdRjCj9"];

	function loadTracks(){
		$.getJSON("/users/" + destinationId + "/play/" + currentPlaylist)
			.done(function(songData, status){
				console.log(songData, "data inside of loadTracks getJSON call");

				var tracksArr = songData.playlist.trackIds;
				console.log(tracksArr, "tracksArr");

				for (var i = 0; i < tracksArr.length; i++ ) {
					var thisTrackId = tracksArr[i].trackId;
					// console.log(thisTrackId, "thisTrackId");
					songsArray.push(thisTrackId);
				}
				// console.log(songsArray, "songsArray 1");
				return songsArray;
			})
			.fail(function(){
				console.log("error with ajax request to get/playlist route");
			});
	} // close loadTracks()
	
	loadTracks();

// if I had lots more time, I could refactor to - put the code to play the game inside of a function,
// and call that functino when loadTracks() is done (inside of it). However, since the code to play doesn't
// run until the user clicks the 'start' button, which is most likely after the page is finished loading,
// it's a very small difference in time ("race condition" is what Tim called it). Also, if the start
// button doesn't load it the first time, it does load it the second time it is clicked, so the user
// should still be able to figure out how to play easily enough.



	// (more) global variables
	var currentSong;
	var counter = 0;
	var $startGameForm = $("#startGameForm");
	var $startButton = $("#startButton");
	var $audioPreviewUrl = $("#audioPreviewUrl");
	var $divUserInputGuess = $("#divUserInputGuess");
	var $inputGuessForm = $("#inputGuessForm");
	var $countdown = $("#countdown");
	var $divScore = $("#divScore");
	var $pSongResults = $("#pSongResults");
	var dataSpotify;
	var $userInputGuess = $("#userInputGuess");
	var scoreCorrect = 0;
	var scoreIncorrect = 0;
	var $numCorrect = $("#numCorrect");
	var $numIncorrect = $("#numIncorrect");
	var $songCount = $("#songCount");
	var $divSongCount = $("#divSongCount");
	var $countdownTimer = $("#countdownTimer");
	var $countdownTimerHeader = $("#countdownTimerHeader");
	var timeLeft;
	var allCurrentArtists = "";
	

	// hide parts of the page on inital page load
	$divUserInputGuess.hide();
	$divSongResults.hide();
	$divScore.hide();
	$divSongCount.hide();
	$countdown.hide();


	// play a new song
	// when "start" button/form is clicked & make request to my database,
	$startGameForm.on("submit", function(event){		// why is on.submit not working, but on.click works?
		event.preventDefault();
		console.log("#startGameForm submitted");

		currentSong = songsArray[counter];	

		// make request to my Tracks database to get info for the song
		$.getJSON("/track/" + currentSong)
			.done(function(fullTrackData, status){
				console.log(fullTrackData, "fullTrackData");
				dataSpotify = fullTrackData;
				console.log(dataSpotify, "dataSpotify");

				// load audio
				$audioPreviewUrl.attr("src", dataSpotify.track.previewUrl);
				// play the song
				$audioPreviewUrl.on("canplay", function() {
					$audioPreviewUrl[0].play();
				});

				// load all artists in current track to global variable for use in display results function below
				function getAllArtistNames(){
					for(var a = 0; a < dataSpotify.track.artist.length; a++){
						var artistStringName = dataSpotify.track.artist[a].name;
						// console.log(artistStringName, "getting artist name correctly?");
						allCurrentArtists = allCurrentArtists.concat(artistStringName);
						allCurrentArtists = allCurrentArtists.concat(", ");
					}
					console.log(allCurrentArtists, "allCurrentArtists");
					return allCurrentArtists;
				} // close getAllArtistNames()
				getAllArtistNames();

				// hide the start button, show the guess form, hide the results from previous answer
				$startGameForm.hide();
				$userInputGuess.val(" "); 	// clear the text in the guess input
				$divUserInputGuess.show();
				$divSongResults.hide();
				$divScore.hide();

				// show how many guesses they have left
				$divSongCount.show();
				$songCount.html("You are on guess # " + counter + " of 10.");

		// count down a timer from 30 seconds
				// all previews are 30 seconds according to Spotify API documentation
				$countdown.show();

				timeLeft = 29;
				function countdown(){
					if (timeLeft === 0){
						$countdownTimerHeader.html("");
						// $countdownTimer.html("time is up");
						$countdownTimer.html("");
						// console.log("time is up");
						clearInterval(someIntervalId);
					}
					else {
						$countdownTimerHeader.html("Seconds left to guess:");
						$countdownTimer.html(timeLeft);
						// console.log(timeLeft)
						timeLeft--;
					}
				}
				
				var someIntervalId;
				function startTimer(){
					someIntervalId = setInterval(countdown, 1000);
				}
				
				startTimer();

			})
			.fail(function(){
				console.log("error with ajax request to get track/thisTrackId route");
			});

		// increase the counter to move to next trackId in songsArray
		counter = counter + 1;

	});


	// submit user's guess
	// show the info for the song from my database
	$inputGuessForm.on("submit", function(event){
		event.preventDefault();
		console.log("#divUserInputGuess submitted");

		$pSongResults.html( "<li><img src='" + dataSpotify.track.artworkUrl + "'>" +

/// add artist name for ALL artists
							"<li>Artist(s): " + allCurrentArtists + "</li>" + 
							"<li>Song title: " + dataSpotify.track.title + "</li>" +
							"<li>Album: " + dataSpotify.track.album + "</li>");

		// stop music from playing
		$audioPreviewUrl[0].pause();

		// hide the guess button, show the song results
		$divUserInputGuess.hide();

		$divSongResults.show();
		$startButton.val("Play again");
		$startGameForm.show();
		$divSongCount.show();
		$countdown.hide();
		timeLeft = 0; // clear the countdown timer so it doesn't show both timers if the user guesses before the time is up
		
		// check user's guess against song results
		var guessAsIs = $userInputGuess.val();
		var guessLowerCased = guessAsIs.toLowerCase();
		console.log("guessLowerCased is " + guessLowerCased);

/// add artist name for ALL artists
		var answerArtist = allCurrentArtists;
		var answerSong = dataSpotify.track.title;
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
			$numIncorrect.html("Incorrect: " + scoreIncorrect);
		} 
		// if answer includes guess, return correct answer
		// using .includes() here which is "experimental" according to MDN but seems to work!
		else if (answer.includes(guessLowerCased)){
			console.log("answer is correct!!");
			scoreCorrect = scoreCorrect + 1;
			$numCorrect.html("Correct: " + scoreCorrect);
		} 
		// otherwise, return wrong answer
		else {
			console.log("answer is incorrect");
			scoreIncorrect = scoreIncorrect + 1;
			$numIncorrect.html("Incorrect: " + scoreIncorrect);
		}

		
		// display score
		$divScore.show();

	});




	// store data about song & user's score in our database(s)







}); // close $ wrapper
