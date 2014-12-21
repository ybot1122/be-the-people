/*
	background.js - functions to manage the rotating gif backgrounds
*/

// wrapper for an ajax request to the database for a list of background images
function loadBgs(data) {
	var bgs = [];
	for (item in data) {
		bgs.push('graphics/' + data[item].M.filename.S);
	}
	console.log(bgs);
	if (bgs.length < 1) {
		noBackground();
	} else {
		$('#live').css('background-image', 'url(\"' + bgs[0] + '\")');
		rotateGraphic(0, bgs, 0);
	}
}

// invoked when the ajax query fails or receives an empty array
// >>>> this is where we would define the 'default' background
function noBackground() {
	$('.bg').remove();
	$('#container').css('background-color', 'gray');
}

// invoked when a list of background images is provided and there is more
// than one image available to rotate
function rotateGraphic(counter, data, fadeTime) {
	var graphics = data;
	var next = (counter + 1) % graphics.length;
	var $currVis;
	var $currHide;
	if ($('#live').is(':visible')) {
		$currVis = $('#live');
		$currHide = $('#next');
	} else {
		$currVis = $('#next');
		$currHide = $('#live');
	}
	$currVis.fadeOut(fadeTime, function() {
		$currVis.css('background-image', 'url(\"' + graphics[next] + '\")');
	});
	$currHide.fadeIn(fadeTime);
	if (graphics.length > 1) {
		setTimeout(function() { 
			rotateGraphic(next, data, 1000);
		}, 7000);
	}
}
