/*
	content.js - functions to invoke when retrieving content from the database
*/

/*
	updateContent(pagename) - makes an ajax request to the server for content info
	and then uses Mustache templating to render the contents. manages the sliding
	transition animation also.
		pagename 	=> 	string identifying the page to load content for
*/
function updateContent(pagename) {
	var $button = $('#' + pagename);
	// check if client just wants to toggle display
	if ($button.is('span[data-active=\"true\"]')) {
		$('#content').slideUp('1500');
		$button.removeAttr('data-active');
	} else {
		// switch active button and then render the html
		$('span[data-active=\"true\"]').removeAttr('data-active');
		$button.attr('data-active', 'true');
		$('#content').slideUp('1500', function() {
			$('#loading').show();
			loadContent(pagename, function(data) {
				loadTemplate($('#content div'), '#template-' + pagename, 'general.html', data,
				function() {
					$('#loading').hide();
					$('#content').slideDown('1500');
				});
			});
		});
	}
}

function loadContent(pagename, callback) {
	var request = $.ajax({
		url: '/?page=' + pagename,
		type: 'GET',
		datatype: 'JSON'
	});

	request.done(function(data, msg) {
		if (!data || data === null || data.error) {
			callback({error: 'bad request'});
		} else {
			callback({data: data});
		}
	});

	request.fail(function(data, msg) {
		callback({error: 'database currently down'});
	});
}

function loadTemplate($destination, selector, filename, data, callback) {
	$destination.load('templates/' + filename + ' ' + selector, 
	function(response, status, xhr) {
		$destination.html(Mustache.render($destination.text(), data));
		callback();
	});
}