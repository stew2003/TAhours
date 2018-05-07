//begin boilerplate
var express = require('express');
var anyDB = require('any-db');
var bodyParser = require("body-parser");
var conn = anyDB.createConnection('sqlite3://TAhours.db');
var app = express();
var mustache = require('mustache-express');
var server = require('http').createServer(app);
var passport = require('passport');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var io = require('socket.io')(server);
var auth = require('./auth');
var middleware = require('./middleware.js');

auth(passport);

app.engine('html', mustache());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieSession({
    name: 'session',
    keys: ['TAhoursForSTABStudents']
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());  
//end boilerplate

conn.query("CREATE TABLE IF NOT EXISTS students (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, place TEXT, class TEXT, help TEXT);");
conn.query("CREATE TABLE IF NOT EXISTS admins (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT);");

//add new student to database
function addStud(student){
	conn.query("INSERT INTO students (name, place, class, help) VALUES (?, ?, ?, ?)", [student.name, student.place, student.class, student.help], function(err, data){
		if (err) throw err;
	});
}

function getStudentInfo(callback){
	conn.query("SELECT * FROM students", function(err, data){
		if (err) throw err;
		callback({rows: data.rows});
	});
}

function authenticateAdmin(email, request, response, callback){
	conn.query("SELECT * FROM admins WHERE email = ?", [email], function(err, data){
		if(err) throw err;
		if (data.rows.length == 1){
			request.user.isAdmin = true;
			response.redirect('/admin');
		}
		else{
			callback();
		}
	});
}

function authenticateStudent(domain, request, response){
	if(domain == "students.stab.org"){
		request.user.isStudent = true;
		response.redirect('/student');
	}
	else{
		
	}
}

//socket handling
io.on('connection', function(socket){
	//on request to add new Student
	socket.on('newStudent', function(student){
		addStud(student);
	});
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['email']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/google'
    }),
    function(request, response){
    	authenticateAdmin(request.user.profile.emails[0].value, request, response, function(){
    		authenticateStudent(request.user.profile._json.domain, request, response);
    	});
    }
);
app.get('/student', middleware.isAuthenticated, function(request, response){
	getStudentInfo(function(students){
		response.render('student.html', students);
	});
});

app.get('/admin', middleware.isAuthenticated, middleware.isStaff, function(response, response){
	response.send("Yo")
});

app.get('/logout', function(request, response){
    request.logout();
    request.session = null;
    response.redirect('/');
});

//redirect all unknown endpoints to /login
app.get('*', function(request, response){
	response.redirect('/auth/google');
});

server.listen(8080, function() {
	console.log("TA hours help server listening on port 8080");
});