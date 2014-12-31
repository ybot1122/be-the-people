/*
	js/content.js
	functions to invoke when retrieving content from the database
*/

/*
	This function was fun to write. 

	the contentStruct object stores a mapping of pagename to
		a) title: a string which represents the title of the panel
		b) content: a dom element that contains the rendered html

	1) load templates into a dummy dom element
	2) load the json data for page content
	3) render the html from the templates and content and store it as
			a dom element in the contentStruct object
	4) initialize an event listener on all infocolumn divs that can pull
			content from the structure as necessary
*/
function initContent() {
	$('.infocolumn').remove();
	var contentStruct = {};
	// initialize and define the home button dom element
	var $exitButton = $('<div></div>', {id: 'home'});
	$exitButton.html('CLOSE');
	$exitButton.click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		shrinkColumns();
		enablePanelClicking($exitButton, contentStruct);
	});
	// load page templates
	$temp = $('<div></div>');
	$temp.load('templates/general.html', function() {
		// make request for page content
		loadContent(function(pages) {
			// populate struct with information for each page
			for (var page in pages) {
				if (page === 'backgrounds') {
					var timer = loadBgs(pages[page]);
					initAdminPanel(pages, timer);
					continue;
				}
				var template = $temp.find('#template-'+page).text();
				contentStruct[page] = {};
				contentStruct[page].title = page;
				contentStruct[page].content = generateRenderedHtml(page, pages[page], template);
				$currPanel = $('<div></div>', {class: 'infocolumn', id: page});
				$currPanel.html($('<h2></h2>').html(page));
				$('#main').append($currPanel);
			}
			// define click behavior across all panels
			enablePanelClicking($exitButton, contentStruct);		
		});
	});
}

function enablePanelClicking($exitButton, contentStruct) {
	$('.infocolumn').on('click', function(e) {
		$('.infocolumn').off('click');
		e.preventDefault();
		e.stopPropagation();
		var selectedPage = $(this).attr('id');
		expandColumns($(this));
		$(this).prepend($exitButton);
		$(this).append(contentStruct[selectedPage].content);
	});
}

// expand the active panel, shrink others, show home button
function expandColumns($activePanel) {
	$activePanel.animate({
		width: '95%',
		opacity: '1.0',
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
		opacity: '.8',
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

function generateRenderedHtml(pagename, content, template) {
	$element = $('<div></div>', {id: 'activeContent'});
	$element.html(Mustache.render(template, {data: content}));
	return $element;
}