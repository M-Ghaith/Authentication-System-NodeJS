var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./uploads'}); //handle file uploads
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
// to have access for the user object
var User = require('../models/user');


/* GET users listing. 
   decler new path to connect the links in jade with node function and open the right view.
*/
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next){
	res.render('register',{ title: 'Register' });
});

router.get('/login', function(req, res, next){
	res.render('login', { title: 'Login' });
});


//login authentication using passport libary 
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid username or password!'}),
  function(req, res) {
  	req.flash('success','You are now logged in');
  	res.redirect('/');
 });

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(function(username, password, done){
	User.getUserByUsername(username, function(err, user){
		if (err) throw err;
		if (!user){
			return done(null, false, {message: 'Unknown User!'});
		}

		User.comperPassword(password, user.password, function(err, isMatch){
			if (err) return done(err);
			if (isMatch) {
				return done(null, user);
			}else{
				return done(null, false, {message:'Invalid'});
			}
		});
	});
}));


// this function is handling the form reqest post function its getting
//the input data and uploded file by using upload.single function from 
// multer libary 
router.post('/register', upload.single('profileimage'), function(req, res, next){

	//assign each data reqest to a Var/ using req.body. "the name of the input field"
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	if (req.file){
		console.log('Uploading File..');
		var profileimage = req.file.filename;
	 } else  {
		console.log('No File Uploading');
		var profileimage = 'noimage.jpg'; // if there no image to show we will use a stander image to showing up
	}

	//form valdation using expressValidator
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('username','Username field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Password do not match').equals(req.body.password);

	//Check Errors
	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors: errors
		});
		console.log(errors);

	}else{
		var newUser = new User({ // we use this object in the encryption challback function
			name: name,
			username: username,
			email: email,
			password: password,
			profileimage: profileimage
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success', 'You are now registered and can login');//to send a message to redirect page

		res.location('/');
		res.redirect('/');

	}


});

router.get('/logout',function(req,res){
	req.logout();
	req.flash('success','You are now logged out');
	res.redirect('/users/login');
});

module.exports = router;
