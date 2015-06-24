//_______REQUIRE DEPENDENCIES_______
var mongoose = require("mongoose");
mongoose.set("debug", true);

var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;

//_______DEFINE USER SCHEMA_______
var userSchema = new mongoose.Schema({
	// username: {
	// 	type: String,
	// 	lowercase: true,
	// 	required: true
	// },
	email: {
		type: String,
		lowercase: true,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	avatarUrl: String,
	genres: [],
	numCorrect: Number,
	numIncorrect: Number,
	pointTally: Number,
	rank: Number,
	fastestTimeToGuess: Number,
	friends: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}],
	playlists: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Playlist"
	}],
	rounds: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Round"
	}]
});

//_______USER AUTHENTICATION_______

// hash the user's password input
// this is a pre-save hook, it always runs before we save a user
userSchema.pre("save", function(next){
	var user = this;

	// hash the password if it has been modified or is new
	if (!user.isModified("password")){		// isModified is a mongoose method
		return next();
	} 

	// generate a salt
	return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if(err){
			return next(err);
		}

		// hash the password using the salt just generated
		return bcrypt.hash(user.password, salt, function(err, hash){
			if(err){
				return next(err);
			}

			// override the cleartext password with the hashed one
			user.password = hash;
			return next(); 	// move to the next function, which is save or create (in app.js??)

		});
	});
});

// check that the user's email is in our database
// if it is, call the function to check the user's password
// class method
userSchema.statics.authenticate = function(formData, callback){
	this.findOne({
		email: formData.email	// check that we have a user with this email
	}),
	function(err, user){ // this is the function we pass out of this function as a callback
		if(user === null){
			callback("Invalid email or password, try again.", null); // invalid email
		} else {
			user.checkPassword(formData, callback); // call the function we define below to check password
		}
	}
}

// compare the user's password input to database password
// instance method
userSchema.methods.checkPassword = function(inputPassword, callback){
	var user = this;
	// user.password is the hashed, salted password we have stored in our database already
	bcrypt.compare(inputPassword, user.password, function(err, isMatch){
		if(isMatch){
			callback(null, user); // tell app.js that this is a match
		} else {
			callback(err, null); // tell app.js that this is not a match
		}
	});
};


//_______EXPORT THE USER MODEL_______
var User = mongoose.model("User", userSchema);
module.exports = User;

