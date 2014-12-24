/*
	js/content.js
	functions to invoke when retrieving content from the database
*/

/*
	This function was fun to write. 
	We make a request to the server for raw page content and store the
	content into a structure. For each page we encounter, we also build out
	a .infocontent panel and attach a one-time click listener to it.

	After all the .infocontent panels have been built and parsed, we define
	behavior for the exit button which resets the panels to their original
	sizes and restores a one-time click listener.
*/
function initContent() {
	var contentStruct = {};
	// initialize and define the home button dom element
	var $exitButton = $('<div></div>', {id: 'home'});
	// make ajax request for page content
	loadContent(function(pages) {
		for (var page in pages) {
			// define the item info
			contentStruct[page] = {};
			contentStruct[page].title = page;
			contentStruct[page].content = pages[page];
			// initialize and define click behavior for panel dom element
			var $currPanel = $('<div></div>', {class: 'infocolumn', id: page});
			(function($element, pagename, content) {
				$element.one('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					makePanelActive($element, $exitButton, content);
				});
			})($currPanel, page, contentStruct[page].content);
			$currPanel.html(contentStruct[page].title);
			$('#main').append($currPanel);
		}
		// attach behavior to the exit button
		$exitButton.click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			$element = $exitButton.parent();
			// reassign the expand on click behavior
			$element.one('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				makePanelActive($element, $exitButton, contentStruct[$element.attr('id')].content);
			});
			shrinkColumns();
		});
	});
}

// shared function for everytime an inactive panel is clicked on
function makePanelActive($targetPanel, $exitButton, content) {
	expandColumns($targetPanel, content);
	$targetPanel.append($exitButton);
	generateRenderedHtml($targetPanel.attr('id'), content);
}

// expand the active panel, shrink others, show home button
function expandColumns($activePanel) {
	$activePanel.animate({
		width: '95%',
		opacity: '.8',
		marginLeft: '2.5%'
	}, 600);
	$('.infocolumn').not($activePanel).animate({
		width:'0%',
		marginLeft:'0',
		opacity: '0'
	}, 600);
}

// shrink active panel, restore others, hide home button
function shrinkColumns(){
	$('#home').detach();
	$('#activeContent').detach();
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
			loadBgs(res.data.bgs);
			delete res.data.bgs;
			var responseObj = {};
			for (var page in res.data) {
				if (page !== 'bgs') {
					responseObj[page] = res.data[page];
				}
			}
			callback(responseObj);
		}
	});

	// request failed to even make it to server
	request.fail(function(data, msg) {
		callback({error: 'database currently down'});
	});
}

/*
	loads a template from the templates/ directory and renders it
	with the supplied data
	appends the rendered dom element to the panel
*/
function generateRenderedHtml(pagename, content) {
	$element = $('<div></div>', {id: 'activeContent'});
	$element.load('templates/general.html #template-' + pagename, function() {
		$element.html(Mustache.render($element.text(), {data: content}));
		$('#' + pagename).append($element);
	});
}