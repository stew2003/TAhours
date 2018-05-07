module.exports = {
	isAuthenticated: function(req, res, next){
		if(req.isAuthenticated()){
			next();
		}
		else{
			res.redirect('/auth/google');
		}
	},
	isStaff: function(req, res, next){ //only called after user is authenticated
		if(req.user.isAdmin){
			next();
		}
		else{
			res.redirect('/student');
		}
	},
	isStudent: function(req, res, next){
		if(req.user.isStudent){
			next();
		}
		else{
			response.send("Please use a STAB account");
		}
	}
}