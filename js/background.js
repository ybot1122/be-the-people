/*
	background.js - functions to manage the rotating gif backgrounds
*/

// wrapper for an ajax request to the database for a list of background images
function loadBgs(callback) {
	var request = $.ajax({
		url: 'http://localhost:8082/?bgs=true',
		type: 'GET',
		datatype: 'JSON'
	});

	request.done(function(data, msg) {
		if (data.length < 1) {
			noBackground();
		} else {
			$('#live').css('background-image', 'url(\"' + data[0] + '\")');
			if (data.length > 1) {
				rotateGraphic(0, data, 0);
			}
		}
	});

	request.fail(function(data, msg) {
		noBackground();
	});
}

// invoked when the ajax query fails or receives an empty array
// >>>> this is where we would define the 'default' background
function noBackground() {
	$('.bg').remove();
	$('#container').css('background-color', 'gray');
}

// invoked when a list of background images is provided and there is more
// than one image available to rotate
function rotateGraphic(counter, data, fadeTime = 500) {
	var graphics = data;
	var next = (counter + 1) % graphics.length;

	$('.bg').fadeToggle(fadeTime, function() {
		var $hidden = ($('#live').is(':visible')) ? $('#next') : $('#live');
		$hidden.css('background-image', 'url(\"' + graphics[next] + '\")');
	});
	setTimeout(function() { 
		rotateGraphic(next, data);
	}, 7000);
}
