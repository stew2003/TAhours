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

auth(passport);

app.engine('html', mustache());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.use(cookieSession({
    name: 'session',
    keys: ['123']
}));

app.use(cookieParser());
//end boilerplate

conn.query("CREATE TABLE IF NOT EXISTS students (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, place TEXT, class TEXT, help TEXT);");
conn.query("CREATE TABLE IF NOT EXISTS admins (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);");

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

//socket handling
io.on('connection', function(socket){
	//on request to add new Student
	socket.on('newStudent', function(student){
		console.log('got it');
		addStud(student);
	});
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['email']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    function(request, response){
    	console.log(request);
    	request.session.token = request.user.token;
    	// authenticateAdmin(request, response);
    }
);

app.get('/login', function(request, response){
	response.render('login.html');
});

app.post('/authenticate', function(request, response){
	if(request.body.yesOrNo == 'Yes'){
		response.redirect('/auth/google');
	}
	else if(request.body.yesOrNo == 'No'){
		response.redirect('/student');		
	}
	else{
		response.redirect('/login');
	}
});

app.get('/student', function(request, response){
	getStudentInfo(function(students){
		response.render('student.html', students);
	});
});

app.post('/teacher', function(request, response){

});

app.get('/', function(req, res){
	 if (req.session.token) {
        res.cookie('token', req.session.token);
        console.log(res);
        res.json({
            status: 'session cookie set'
        });
    } else {
        res.cookie('token', '')
        console.log(res);
        res.json({
            status: 'session cookie not set'
        });
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/');
});

//redirect all unknown endpoints to /login
app.get('*', function(request, response){
	response.redirect('/login');
});

server.listen(8080, function() {
	console.log("TA hours help server listening on port 8080");
});