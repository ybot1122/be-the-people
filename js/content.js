/*
	js/content.js
	functions to invoke when retrieving content from the database
*/

/*
	detects which content panel is open and either closes it if currently active
	or opens a different panel and loads content to it
*/
function changeActivePage(pagename, content) {
	console.log(content);
	var $button = $('#' + pagename);
	var selectedID = pagename;
	//If the home (X) button is clicked, slide the content div down then calls a shrinkcolumns function
	if($button.is('#home')){
		makeEverythingAvailable();
		$button.fadeOut(300);
		$('#main-frame').animate({
			height: '0%'
		}, 1000, shrinkColumns);
	} else {
		//make the active column 95%, while making the others 0% width and remove their margin for sizing issues
		//Calls expandColumn callback function to show the content div once they are expanded.

		// if something is already selected, that isnt this new item
		if (!selectedAlready(selectedID)) {
			//console.log("did i reach here");
			$('#' + pagename).attr('name', 'selected');
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
			}, 600, expandColumns($button, pagename, content));
		}
	}
	// TODO: make request to server, get the data, and render the template
}

function selectedAlready(selectedID) {
	var divs = $('#main').find('.infocolumn');
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].attributes[3])
			console.log(divs[i].attributes[3].value);
		if (divs[i].attributes[3] && divs[i].id !== selectedID) {
			//console.log(selectedID + " " + divs[i].id);
			return true;
		}
	}
	return false;
}

function makeEverythingAvailable() {
	$('#about').removeAttr('name');
	$('#chapters').removeAttr('name');
	$('#contact').removeAttr('name');
}

//Shows the home button, content div, and slides the content up
function expandColumns($button, pagename, content) {
	loadTemplate($('#content'), "#template-" + pagename, "general.html", content, function() {
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
			callback({
				about: res.data.about,
				chapters: res.data.chapters,
				contact: res.data.contact
			});
		}
	});

	// request failed to even make it to server
	request.fail(function(data, msg) {
		callback({error: 'database currently down'});
	});
}

function initializeCols(response) {
	console.log(response);
	$('#home').click(function(e) {
		changeActivePage('home');
	});
	$('#about').click(function(e) {
		changeActivePage('about', {data: response.about});
	});
	$('#chapters').click(function(e) {
		changeActivePage('chapters', {data: response.chapters});
	});
	$('#contact').click(function(e) {
		changeActivePage('contact', {data: response.contact});
	});
	$('#auth').click(function(e) {
		// Only activate if the admin panel is not already present
		if ($('#admin').length == 0) {
			$active = $('span[data-active=\"true\"]');
			$active.click();
			$('#menu').fadeTo(500, 0.0, function() {
				$('#menu').hide();
			});
			console.log(response);
			renderModal($active, response);
		}
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
