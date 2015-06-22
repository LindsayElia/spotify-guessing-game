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

require('dotenv').load();

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(morgan("tiny"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(loginMiddleware);

// app.use(session({
// 	maxAge: ,	//number
// 	secret: "",	//string
// 	name: "" 	//string
// }));

