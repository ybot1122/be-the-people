/*
	js/content.js
	functions to invoke when retrieving content from the database
*/

/*
	detects which content panel is open and either closes it if currently active
	or opens a different panel and loads content to it
*/
function changeActivePage(pagename) {
	var $button = $('#' + pagename);
	var selectedID = $button.id;
	console.log(selectedID);
	//If the home button is clicked, slide the content div down then calls a shrinkcolumns function
	if($button.is('#home')){
		$button.fadeOut(300);
		$('#main-frame').animate({
			height: '0%'
		}, 1000, shrinkColumns);
	} else {
		//make the active column 95%, while making the others 0% width and remove their margin for sizing issues
		//Calls expandColumn callback function to show the content div once they are expanded.
		$button.animate({
			width:'95%',
			opacity: '.8',
			marginLeft: '2.5%'
		}, 600);
		// hide all the other columns
		$('.infocolumn').not($button).animate({
			width:'0%',
			marginLeft:'0',
			opacity: '0'
		}, 600, expandColumns($button, pagename));
	}
	// TODO: make request to server, get the data, and render the template
}

//Shows the home button, content div, and slides the content up
function expandColumns($button, pagename) {
	data = {};
	loadTemplate($('#content'), "#template-" + pagename, "general.html", data, function() {
		$('#home').show();
		$('#main-frame').show();
		$('.infocolumn').not($button);
		$('#main-frame').animate({
			height: '75%'
		}, 1000);
	});
}

//hides the content div and shrinks the columns to the original size
function shrinkColumns(){
	$('#main-frame').hide();
	$('.infocolumn').animate({
		width: '30%',
		marginLeft:'2.5%',
		opacity: '.6',
		marginLeft:'2.5%'
	}, 600);
}

/*
	wrapper function for sending a GET AJAX request to
*/
function loadContent(callback) {
	var request = $.ajax({
		url: '/?page',
		type: 'GET',
		datatype: 'JSON'
	});

	request.done(function(res, msg) {
		if (!res || res === null || res.status === 'failure') {
			// request went to server but didn't work
			callback({error: 'bad request'});
		} else {
			// request succeeded
			callback({data: res.data});
		}
	});

	// request failed to even make it to server
	request.fail(function(data, msg) {
		callback({error: 'database currently down'});
	});
}

function initializeCols(response) {
	$('#home').click(function(e) {
		changeActivePage('home');
	});
	$('#about').click(function(e) {
		changeActivePage('about');
	});
	$('#chapters').click(function(e) {
		changeActivePage('chapters');
	});
	$('#contact').click(function(e) {
		changeActivePage('contact');
	});
	$('#home, #about, #chapters, #contact').slideDown(1000);
}

/*
	This function is used across multiple parts of the program. It is a wrapper function
	for rendering our mustache.js templates.
*/
function loadTemplate($destination, selector, filename, data, callback) {
	$destination.load('templates/' + filename + ' ' + selector,
	function(response, status, xhr) {
		$destination.html(Mustache.render($destination.text(), data));
		callback();
	});
}
