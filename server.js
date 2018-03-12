//server.js
var express = require('express');
var anyDB = require('any-db');
var path = require('path');
var bodyParser = require("body-parser");
var conn = anyDB.createConnection('sqlite3://TAhours.db');
var session = require('express-session');
var cheerio = require('cheerio');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

conn.query("CREATE TABLE IF NOT EXISTS students (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, place TEXT, class TEXT, help TEXT);");
conn.query("CREATE TABLE IF NOT EXISTS password (uid INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);");

app.use(session({
	secret: Math.floor(Math.random() * 101).toString(),
	cookie:{maxAge: 600000},
	saveUninitialized: false,
	resave: false
}));

app.get('/', function(request, response){
	response.redirect('/login');
	// response.setHeader('Content-Type', 'text/html');
 //    response.write('<p>expires in: ' + (request.session.cookie.maxAge / 1000) + ' seconds</p>')
 //    response.end()
	// if (request.session.cookie){
	// 	request.session.views++
 //    	response.setHeader('Content-Type', 'text/html')
 //    	response.write('<p>views: ' + request.session.views + '</p>')
 //    	response.write('<p>expires in: ' + (request.session.cookie.maxAge / 1000) + 's</p>')
 //    	response.end()
	// }
	// else {
 //    request.session.views = 1
 //    response.end('welcome to the session demo. refresh!')
	// }
	// response.sendFile(path.join(__dirname + '/index.html'));
	// conn.query("SELECT name FROM students", function(err, studentName){
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	response.send(studentName.rows[0].name);
	// });
});

app.get('/login', function(request, response){
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/authenticate', function(request, response){
	if(request.body.yesOrNo == 'Yes'){
		response.sendFile(path.join(__dirname + '/authenticate.html'));
	}
	else if(request.body.yesOrNo == 'No'){
		response.redirect('/student');		
	}
	else{
		response.redirect('/login');
	}
});

app.get('/student', function(request, response){
	response.sendFile(path.join(__dirname + '/student.html'));
});

app.post('/teacher', function(request, response){
	conn.query("SELECT username FROM password;", function(err, data){
		var possibleUsernames = data.rows;
		conn.query("SELECT password FROM password;", function(err, data2){
			var possiblePasswords = data2.rows;

			for (var i = 0; i < possibleUsernames.length; i++){
				if(possibleUsernames[i].username == request.body.username && possiblePasswords[i].password == request.body.password){
					request.session.authenticated = true;
					response.redirect('/teacher');
					break;			
				}
				else if (i == possibleUsernames.length -1){
					// response.sendFile(path.join(__dirname + '/authenticate.html'));
						var authenticateHtml = fs.readFileSync(path.join(__dirname + '/authenticate.html'), 'utf8');
						var $ = cheerio.load(authenticateHtml);
						var randNum = Math.floor(Math.random() * Math.floor(2));
						if (randNum == 1){
							$("#userAndPass").prepend("<div id='message'>Wrong username or password. Please try again.</div>");
						}
						else{
							$("#userAndPass").prepend("<div id='message'>Incorrect username or password.</div>");
						}
						$("#username").val(request.body.username);
						response.send($.html());
						break;
				}
			} 
		});
	});
});

app.get('/teacher', function(request, response){
	if(request.session.authenticated == false || request.session.authenticated == undefined){
		response.redirect('/login');
	}
	else{
		response.sendFile(path.join(__dirname + '/teacher.html'));	
	}
});

app.get('/getStudentList', function(request, response){
	conn.query("SELECT name FROM students;", function(err, data){
		namesObj = data.rows;
		namesList = [];
		for(var i=0; i<namesObj.length; i++){
			namesList.push(namesObj[i].name);
		}
		response.send(namesList);
	});
});

app.get('/getTeacherList', function(request, response){
	conn.query("SELECT * FROM students;", function(err, data){
		studentObj = data.rows
		studentList = [];
		for(var i=0; i<studentObj.length; i++){
			insideList = [];
			insideList.push(studentObj[i].name);
			insideList.push(studentObj[i].place);
			insideList.push(studentObj[i].class);
			insideList.push(studentObj[i].help);
			studentList.push(insideList);
		}
		response.send(studentList);
	});
});

app.post('/getTeacherList', function(request, response){
	conn.query("DELETE FROM students WHERE name = ?;", [request.body.name]);
	response.end();
});

app.post('/student', function(request, response){
	conn.query("INSERT INTO students (name, place, class, help) VALUES (?, ?, ?, ?)", [request.body.name, request.body.place, request.body.classIn, request.body.help]);
	response.end();
});

app.listen('8080');