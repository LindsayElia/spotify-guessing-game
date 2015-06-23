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

//______________ROUTES______________

//_______HOME_______

// ROOT
app.get("/", function(req, res){
	res.redirect("/index");
});

// INDEX - show "index"
app.get("/index", function(req, res){
	res.render("users/index");
});

//_______LOGIN_______

// LOGIN - GET "login"
// show the login page
app.get("/login", function(req, res){
	res.render("users/login");
});

// LOGIN - POST "login"
// sign the user in and redirect to page showing all players "/index"
app.post("/login", function(req, res){
	// do stuff
	res.redirect("/index");
});

//_______SIGNUP_______

// SIGNUP - GET "signup"
// show the signup page
app.get("/signup", function(req, res){
	res.render("users/signup");
});

// SIGNUP - POST "signup"
// create a new user and redirect to "/edit" for user to enter their player bio info
app.post("/signup", function(req, res){
	// do stuff
	res.redirect("/edit");
});

//_______USER ROUTES_______

// SHOW - GET "show"
// show user's bio
app.get("/show", function(req, res){
	res.render("users/show");
});

// EDIT - GET "edit"
// show form to edit user's bio
app.get("/edit", function(req, res){
	res.render("users/edit");
});

// SHOW - POST "show"
// post updated/edited bio info & redirect to the show page
app.post("/show", function(req, res){
	// do stuff
	res.redirect("/show");
});






// 404 page - oopsie
app.get("*", function(req, res){
	res.render("errors/404");
});

// _______START SERVER_______
// remote port or localhost
app.listen(process.env.PORT || 3000, function(){
	console.log("Server is starting on port 3000");
});
