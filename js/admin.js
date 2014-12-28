/*
	js/admin.js
	Includes functions for rendering the admin modal, and adding events
	to admin related elements
*/

/*
	Initializes the auth button to pressed and begin admin flow.
	reset is a callback function to be invoked after the admin
	panel has been exited.
*/
function initAdminPanel(content, resetApp) {
	$('#auth').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		renderModal(content, resetApp);
		$('#live, #next').fadeOut(600);
	});
}

/*
	Build the overall admin panel frame and divs for each form
	as well as the buttons
*/
function buildFrame(content) {
	var $frame = $('<div></div>', {id: 'admin'});
	var $buttons = $('<div></div>', {id: 'buttons'});
	$frame.append($buttons);
	$buttons.append($('<span id="exit">exit</span>'));
	for (var page in content) {
		var $form = $('<div></div>', {id: page + '-form', class: 'adminForm'});
		$form.html(page);
		$buttons.append($('<span id="' + page + '">' + page + '</span>', {id: page}));
		$frame.append($form);
	}
	$submitButton = $('<input id="adminSubmit" type="submit" value="Submit all changes" />');
	$frame.append($('<div></div>', {id: 'buttonHolder'}).append($submitButton));
	$frame.hide();
	return $frame;
}

// hides main website and launches admin modal
function renderModal(content, resetApp) {
	authenticateFb('verify', function(response) {
		if (!response || response === null || response.status !== 'success') {
			// authentication failed, exit out of admin modal
			alert('you must be authenticated on facebook');
			destroyModal(resetApp);
			return;
		}
		var $frame = buildFrame(content);
		$('#container').prepend($frame);
		attachButtonBehavior(content, resetApp);
		$('#main').slideUp(600, function() {
				$frame.slideDown(600);
		});
	});
}

// destroys the admin modal and restores the main website
function destroyModal(resetApp) {
	$('#admin').slideUp(600, function() {
		$('#main').slideDown(600);
		$('#admin').remove();
		resetApp();
	});
}

// TODO: tell the admin-modal buttons what to do
function attachButtonBehavior(content, resetApp) {
	$('#exit').click(function(e) {
		destroyModal(resetApp);
	});
	$('#buttons').find('span').not('#exit').each(adminNavButtonBehavior);
	$('#adminSubmit').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		deliverUpdateObject(resetApp);
	});
}

function adminNavButtonBehavior(ind, element) {
	var formName = $(element).attr('id');
	$(element).mouseenter(function(e) {
		$('#whiteBars #backgroundBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});
	$(element).mouseleave(function(e){
		$('#whiteBars #backgroundBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});
	$(element).click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#admin div[id*=-form]:visible').hide();
		$('#' + formName + '-form').show();
		$('#buttonHolder').show();
	});
	$('#' + formName + '-form #addRow').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var fields = $(this).data('fields').split(" ");
		var $row = $('<tr></tr>');
		var	$removeLink = $('<a></a>', {href: '#'});
		$removeLink.one('click', function(e) {
			e.stopPropagation();
			e.preventDefault();
			$(this).parents('tr').remove();
		})
		$removeLink.html('Remove Row');
		for (var i in fields) {
			if (fields[i] === 'body') {
				$row.append($('<td></td>').html('<textarea data-type="body"></textarea>'));
			} else {
				$row.append($('<td></td>').html('<input class="item" data-type="' + fields[i] + '" type="text" />'));
			}
		}
		$row.append($('<td></td>').append($removeLink));

		$('#' + formName + '-form').find('#addRow').parents('tr').before($row);
	});
}

// invoked when user submits changes from the admin panel
function deliverUpdateObject() {
	var result = {};
	$('#buttons').find('span').not('#exit').each(function(ind, element) {
		var pagename = $(element).attr('id');
		result[pagename] = [];
		$('#' + pagename + '-form tr').each(function(i, item) {
			var newItem = {};
			if ($(item).find('.del').is(':checked')) {
				return;
			}
			$(item).find('.item').each(function(n, field) {
				newItem[$(field).data('type')] = $(field).val();
			});
			if (!$.isEmptyObject(newItem)) {
				result[pagename].push(newItem);
			}
		});
	});
	delete result.backgrounds;
	var resultString = JSON.stringify(result);
	authenticateFb('update&upData=' + resultString, function(response) {
		destroyModal(resetApp);
	});
}

function loadTemplate($destination, selector, filename, data, callback) {
	$destination.load('templates/' + filename + ' ' + selector,
	function(response, status, xhr) {
		$destination.html(Mustache.render($destination.text(), data));
		callback();
	});
}