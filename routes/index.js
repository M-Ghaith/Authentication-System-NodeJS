var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

function ensureAuthenticated(req,res,next){
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/users/login');
}

//this line allowed us to access this file from different rout.
module.exports = router;
