$(function() {

	console.log("userProfile.js file loaded");

	var $userProfileDiv = $("#userProfileDiv");

	// make request to Spotify API
	// get user's profile info for currently logged in user
	$.ajax({
		method: "GET",
		url: "https://api.spotify.com/v1/me",
		})
		.done(function(dataRcvd, status){
			console.log(status);
			console.log(dataRcvd, "logging spotify user data from ajax get");
	});

	//$userProfileDiv.append("<p>hello</p>");


}); // close $ wrapper