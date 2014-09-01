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
	$('#content').slideUp('1500', function() {
		$('#loading').show();
		loadContent(pagename, function(data) {
			$('#content h3').html(pagename);
			if (data.hasOwnProperty('error')) {
				$('#content div').html(Mustache.render(
						'<p class=\"error\">{{error}}</p>', data));
			} else {
				$('#content div').html(Mustache.render('<p>{{body}}</p>', data));
			}
			$('#loading').hide();
			$('#content').slideDown('1500');
		});
	});
}

function loadContent(pagename, callback) {
	var request = $.ajax({
		url: 'http://localhost:8081/?page=' + pagename,
		type: 'GET',
		datatype: 'JSON'
	});

	request.done(function(data, msg) {
		callback(data);
	});

	request.fail(function(data, msg) {
		callback({error: 'database currently down'});
	});
}