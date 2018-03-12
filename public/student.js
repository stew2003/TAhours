function createList(){
	var list = $('#list');
	var textOfList = list.html();
	textOfList = textOfList.slice(4, -5);
	textOfList = textOfList.split("</li><li>");
	$.get('/getStudentList', function(listOfNames){
		if (textOfList != listOfNames){
			list.empty();
			for(var i = 0; i<listOfNames.length; i++){
				var newListElement = document.createElement('li');
				// $(newListElement).addClass('studentList');
				$(newListElement).html(listOfNames[i]);
				$(newListElement).appendTo(list);
			}
		}	
	});
}

$(document).ready(function(){
	createList();
})

$('#submit').click(function(){
	var name = $('#name').val();
	var place = $('#place').val();
	var classIn = $('#class').val();
	var help = $('#help').val();
	$('p').remove();
	if(name == "" || place == "" || classIn == "" || help == ""){
		if (name == ""){
			$('#nameDiv > p').remove();
			var error = document.createElement('p');
			$(error).html("Please input in your name.");
			$(error).addClass('error');
			$(error).appendTo($('#nameDiv'));
		} else{
			var p = document.createElement('p');
			$(p).appendTo($('#nameDiv'));
		}
		if (place == ""){
			$('#placeDiv > p').remove();
			var error = document.createElement('p');
			$(error).html("Please choose a place.");
			$(error).addClass('error');
			$(error).appendTo($('#placeDiv'));
		} else{
			var p = document.createElement('p');
			$(p).appendTo($('#placeDiv'));
		}
		if (classIn == ""){
			$('#classDiv > p').remove();
			var error = document.createElement('p');
			$(error).html("Please choose a class.");
			$(error).addClass('error');
			$(error).appendTo($('#classDiv'));
		} else{
			var p = document.createElement('p');
			$(p).appendTo($('#classDiv'));
		}
		if (help == ""){
			$('#helpDiv > p').remove();
			var error = document.createElement('p');
			$(error).html("Please choose a problem.");
			$(error).addClass('error');
			$(error).appendTo($('#helpDiv'));
		} else{
			var p = document.createElement('p');
			$(p).appendTo($('#helpDiv'));
		}
	}
	else{
		$.post('/student', {name: name, place: place, classIn: classIn, help: help}, function(data){
			createList();
			var p1 = document.createElement('p');
			$(p1).appendTo($('#nameDiv'));
			var p2 = document.createElement('p');
			$(p2).appendTo($('#placeDiv'));
			var p3 = document.createElement('p');
			$(p3).appendTo($('#classDiv'));
			var p4 = document.createElement('p');
			$(p4).appendTo($('#helpDiv'));
		});
		$('#name').val("");
		$('#place').val("");
		$('#class').val("");
		$('#help').val("");
	}
});

setInterval(createList, 3000);