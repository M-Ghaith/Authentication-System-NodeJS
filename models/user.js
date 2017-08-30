var mongoose = require ('mongoose');
var bcrypt = require('bcryptjs');
//connect the schema that i had already created
mongoose.connect('mongodb://localhost/nodeauth',{
  useMongoClient: true,

});

var db = mongoose.connection;

//User Schema

var UserSchema = mongoose.Schema({
	username:{
		type: String,
		index: true
	},
	password:{
		type: String
	},
	email:{
		type: String
	},
	name:{
		type: String
	},
	profileimage:{
		type: String
	}
});

//to be able to use this var out side the models
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id,callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comperPassword = function (candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
     callback(null, isMatch);
});
}
//callback function with encrypted the password 
module.exports.createUser = function(newUser, callback){
        bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {//newUser is an object in the users.js has all the input data
        newUser.password = hash;
        newUser.save(callback);

    });
});
	
} 