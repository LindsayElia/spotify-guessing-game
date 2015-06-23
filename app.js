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

//_______ ROUTES - USER??? _______

// ROOT
app.get("/", function(req, res){
	res.redirect("/index");
});

// INDEX
app.get("/index", function(req, res){
	res.render("users/index");
});

// 


// 404 page
app.get("*", function(req, res){
	res.render("errors/404");
});


//_______START SERVER_______
// remote port or localhost
app.listen(process.env.PORT || 3000, function(){
	console.log("Server is starting on port 3000");
});
