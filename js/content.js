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
	//If the home button is clicked, animate all the columns back to the original width and margin
	if($button.is('#home')){
		$button.hide();
		$('#content').animate({
			height: '0%'
		}, 1000, shrinkColumns);
	} else { 
		//make the active column 95%, while making the others 0% width and remove their margin for sizing issues
		$button.animate({width:'95%', marginLeft: '2.5%'}, 600);
		$('.infocolumn').not($button).animate({
			width:'0%', 
			marginLeft:'0'
		}, 600, expandColumns);
	}

	// TODO: make request to server, get the data, and render the template

	/*
	// active page; clicking again means you wanna close it
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
			loadContent(pagename, function(data) {
				loadTemplate($('#content div'), '#template-' + pagename, 'general.html', data, function(){})
			});
		});
	}
	*/
}

function expandColumns(){
	$('#home').show();
	$('#content').show()
	$('#content').animate({
		height: '80%'
	}, 1000);
}

function shrinkColumns(){
	$('#content').hide();
	$('.infocolumn').animate({
		width: '30%',
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
