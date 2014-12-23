/*
	js/content.js
	functions to invoke when retrieving content from the database
*/

/*
	CONTENT RENDERING:

	1) load raw json data from the server
	2) load corresponding templates and create dom elements
		a) create a dom element for the title
		b) create a dom element for the content 
		(both should be rendered by mustache already)
	3) consistently use the structure to render content/titles
				and vice versa
*/

function initContent() {
	var contentStruct = {};
	var $exitButton = $('<div></div>', {id: 'home'});
	$exitButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		shrinkColumns();
	});
	loadContent(function(pages) {
		for (var page in pages) {
			var item = {
				title: page,
				content: pages[page]
			};
			contentStruct[page] = item;
			var $currPanel = $('<div></div>', {class: 'infocolumn', id: page});
			(function($element) {
				$element.click(function(e) {
					e.preventDefault();
					e.stopPropagation();
					expandColumns($element);
					$element.append($exitButton);
				});
			})($currPanel);
			$currPanel.html(item.title);
			$('#main').append($currPanel);
		}
	});
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
	$('.infocolumn').animate({
		width: '30%',
		marginLeft:'2.5%',
		opacity: '.6',
		marginLeft:'2.5%'
	}, 600);
	$('#home').detach();
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