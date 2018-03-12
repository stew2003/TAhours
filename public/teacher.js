function createTeacherList(){
	var table = $('#studentTable');
	$.get('/getTeacherList', function(data){
		$('#studentTable tr:not(:first)').remove(); 
		for (var i = 0; i<data.length; i++){
			var row = document.createElement('tr');
			$(row).addClass(i.toString());
			for (var j = 0; j<data[i].length + 1; j++){
				if (j == 0){
					var cell = document.createElement('td');
					var redX = document.createElement('img');
					$(redX).attr('src', '/redX.png');
					$(redX).appendTo(cell);
					$(redX).addClass('redX');
					$(cell).appendTo(row);
				}
				else{
					var cell = document.createElement('td');
					$(cell).html(data[i][j-1]);
					$(cell).appendTo(row);
				}
			}
			$(row).appendTo(table);
		}
	})
}

$(document).ready(function(){
	createTeacherList();
});

$('body').on('click','.redX',function(){
	 trClass = $(this).closest('tr').attr('class');
	 clickedRow = [];
	 $("." + trClass + " td").each(function(){
	 	clickedRow.push($(this).text());
	 })
	clickedRow = clickedRow.slice(1);
	$.post('/getTeacherList', {name: clickedRow[0]}, function(data){
		createTeacherList();
	});
}); 

setInterval(createTeacherList, 3000);