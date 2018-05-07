$(document).ready(function(){
	var socket = io();

	//converts a two word name into a one word id
	function toId(name){
		return name.split(' ').join('');
	}

	$('#submit').click(function(){
		$('.error').remove(); //remove all previous error messages

		var name = $('#name').val(); 
		var	place = $('#place').val();
		var	studClass = $('#class').val();
		var	help = $('#help').val();

		if (name == "" || place == "" || studClass == "" || help == ""){ //if one of the fields isn't filled out, find out which one it is and add an error
			if (name == ""){
				$('#nameDiv label').append("<p class='error'>This is required field.</p>");
			}
			if (place == ""){
				$('#placeDiv label').append("<p class='error'>This is required field.</p>");
			}
			if (studClass == ""){
				$('#classDiv label').append("<p class='error'>This is required field.</p>");
			}
			if (help == ""){
				$('#helpDiv label').append("<p class='error'>This is required field.</p>");
			}
		}
		else{
			socket.emit('newStudent', {name: name, place: place, class: studClass, help: help}); //tell the server that a new student is being added
			var id = toId(name);
			$("#list").append("<li id="+id+">"+name+"</li>"); //add the new student to the list
		}	
	});


});