/*
	background.js - functions to manage the rotating gif backgrounds
*/

// wrapper for an ajax request to the database for a list of background images
function loadBgs(data) {
	var bgs = [];
	for (item in data) {
		bgs.push('graphics/' + data[item].M.filename.S);
	}
	if (bgs.length < 1) {
		noBackground();
	} else {
		$('#live').css('background-image', 'url(\"' + bgs[0] + '\")');
		return rotateGraphic(bgs);
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
// set rotate = false to stop the rotation
function rotateGraphic(images) {
	var counter = 0;
	var timer = 0;

	function loop() {
		counter = (counter + 1) % images.length;
		console.log(counter);
		var $currVis;
		var $currHide;
		if ($('#live').is(':visible')) {
			$currVis = $('#live');
			$currHide = $('#next');
		} else {
			$currVis = $('#next');
			$currHide = $('#live');
		}
		$currVis.fadeOut(600, function() {
			$currVis.css('background-image', 'url(\"' + images[counter] + '\")');
		});
		$currHide.fadeIn(600);
	}

	loop();
	timer = setInterval(loop, 2000);
	return timer;
}
