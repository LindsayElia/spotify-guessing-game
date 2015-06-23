// _______REQUIRE DEPENDENCIES AND SET MIDDLEWARE_______
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var db = require("./models");
var methodOverride = require("method-override");
var session = require("cookie-session");
var morgan = require("morgan");
// var loginMiddleware = require("./middleware/loginHelper");
// var routeMiddleware = require("./middleware/routeHelper");

// not sure this is the correct format for bringing in dotenv ?
// require('dotenv').load();

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(morgan("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
// app.use(loginMiddleware);

// app.use(session({
// 	maxAge: ,	//number
// 	secret: "",	//string
// 	name: "" 	//string
// }));

//_______ ROUTES -- USERS _______

// ROOT
app.get("/", function(req, res){
	res.redirect("/index");
});

// INDEX - show "index"
app.get("/index", function(req, res){
	res.render("users/index");
});

// LOGIN - GET "login"
// show the login page


// LOGIN - POST "login"
// sign the user in and redirect to page showing all players "users/index"



// SIGNUP - GET "signup"
// show the signup page


// SIGNUP - POST "signup"
// create a new user and redirect to "users/edit" for user to enter their player bio info



// SHOW - GET "show"
// show user's bio


// EDIT - GET "edit"
// show form to edit user's bio


// SHOW - POST "show"
// post updated/edited bio info back to the show page







// 404 page - oopsie
app.get("*", function(req, res){
	res.render("errors/404");
});


//_______START SERVER_______
// remote port or localhost
app.listen(process.env.PORT || 3000, function(){
	console.log("Server is starting on port 3000");
});
