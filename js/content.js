/*
	content.js - functions to invoke when retrieving content from the database
*/

/*
	detects which content panel is open and either closes it if currently active
	or opens a different panel and loads content to it
*/
function changeActivePage(pagename) {
	var $button = $('#' + pagename);
	if ($button.is('span[data-active=\"true\"]')) {
		// content pane already open. just close it.
		$('#content').slideUp('1500');
		$button.removeAttr('data-active');
	} else {
		// close active content pane and open new one
		$('span[data-active=\"true\"]').removeAttr('data-active');
		$button.attr('data-active', 'true');
		$('#content').slideUp('1500', function() {
			$('#loading').show();
			// TODO: make request to server, get the data, and render the template
		});
	}
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