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
	//If the home button is clicked, slide the content div down then calls a shrinkcolumns function
	if($button.is('#home')){
		$button.hide();
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
		$('.infocolumn').not($button).animate({
			width:'0%', 
			marginLeft:'0'
		}, 600, expandColumns(pagename));
	}
	// TODO: make request to server, get the data, and render the template
}

//Shows the home button, content div, and slides the content up
function expandColumns(pagename) {
	loadContent(pagename, function(data) {
		loadTemplate($('#content'), "#template-" + pagename, "general.html", data, function() {
			$('#home').show();
			$('#main-frame').show()
			$('#main-frame').animate({
				height: '75%'
			}, 1000);
		});
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
function loadContent(pagename, callback) {
	var request = $.ajax({
		url: '/?page=' + pagename,
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
