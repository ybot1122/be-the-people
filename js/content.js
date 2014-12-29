/*
	js/content.js
	functions to invoke when retrieving content from the database
*/

/*
	Returns a dom element which represents the content parsed into
	appropriate html
*/
function parseIntoDom(page) {
	$container = $('<div></div>', {id: 'activeFrame'});
	for (var item in page) {
		$innerRow = $('<div></div>');
		for (var field in page[item]['M']) {
			$innerRow.append(page[item]['M'][field]['S']);
		}
		$container.append($innerRow);
	}
	return $container;
}

/*
	Generates the panels and appends them to the webpage. 
	Also applies event listners for clicking.
*/
function initContent(data) {
	// initialize and define the home button dom element
	var $exitButton = $('<div></div>', {id: 'home'});
	$exitButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		$(this).detach();
		$('#activeFrame').remove();
		shrinkColumns();
		enablePanelClicking($exitButton, data);
	});
	// iterate through and parse each page
	for (var page in data) {
		var $panel = $('<div></div>', {class: 'infocolumn', id: page});
		$panel.html(data[page].title);
		$('#main').append($panel);
	}
	enablePanelClicking($exitButton, data);
}

/*
	Applies click behavior to panels
*/
function enablePanelClicking($exitButton, content) {
	$('.infocolumn').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var selectedPage = $(this).attr('id');
		expandColumns($(this));
		$(this).prepend($exitButton);
		$(this).append(content[selectedPage].content);
	});
}

// expand the active panel, shrink others, show home button
function expandColumns($activePanel) {
	$activePanel.stop().animate({
		width: '95%',
		opacity: '.8',
		marginLeft: '2.5%'
	}, 600);
	$('.infocolumn').not($activePanel).stop().animate({
		width:'0%',
		marginLeft:'0',
		opacity: '0'
	}, 600);
}

// shrink active panel, restore others, hide home button
function shrinkColumns() {
	$('.infocolumn').stop().animate({
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
		url: '/?page=go',
		type: 'GET',
		datatype: 'JSON'
	});

	request.done(function(res, msg) {
		if (!res || res === null || res.status === 'failure') {
			// request went to server but didn't work
			callback({error: 'bad request'});
		} else {
			// request succeeded
			var responseObj = {};
			for (var page in res.data) {
				responseObj[page] = res.data[page];
			}
			callback(responseObj);
		}
	});

	// request failed to even make it to server
	request.fail(function(data, msg) {
		callback({error: 'database currently down'});
	});
}