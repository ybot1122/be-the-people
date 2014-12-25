/*
	js/admin.js
	Includes functions for rendering the admin modal, and adding events
	to admin related elements
*/

function initAdminPanel(content) {
	$('#auth').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		renderModal(content);
	});
}

// hides main website and launches admin modal
function renderModal(content) {
	authenticateFb('verify', function(response) {
		if (!response || response === null || response.status !== 'success') {
			// authentication failed, exit out of admin modal
			alert('you must be authenticated on facebook');
			destroyModal();
			return;
		}
		$('#container').prepend($('<div id=\"admin\"></div>'));
		$('#admin').hide();
		loadTemplate($('#admin'), '#template-modal', 'admin.html', content, function() {
			attachButtonBehavior();
			$('#main').slideUp(600, function() {
					$('#admin').slideDown(600);
			});
		});
	});
}

// destroys the admin modal and restores the main website
function destroyModal() {
	$('#admin').slideUp(600, 0.0, function() {
		$('#main').slideDown(600);
		$('#admin').remove();
		initContent();
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
		var row = $('<tr></tr>');
		for (var i in fields) {
			if (fields[i] === 'body') {
				row.append($('<td></td>').html('<textarea data-type="body"></textarea>'));
			} else {
				row.append($('<td></td>').html('<input class="item" data-type="' + fields[i] + '" type="text" />'));
			}
		}
		row.append($('<td></td>').html('<input class="del" type="checkbox" />'));
		$('#' + formName + '-form').find('#addRow').parents('tr').before(row);
	});
}

// TODO: tell the admin-modal buttons what to do
function attachButtonBehavior() {
	$('#exit').click(function(e) {
		destroyModal();
	});

	$('#buttons').find('span').each(adminNavButtonBehavior);

	$('#adminSubmit').one('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		deliverUpdateObject();
	});
}

// invoked when user submits changes from the admin panel
function deliverUpdateObject() {
	var result = {
		about: [],
		chapters: [],
		contact: []
	};
	// extract about
	$('#about-form tr').each(function(ind, element) {
		if (!$(element).find('.del').is(':checked')) {
			var paraText = $(element).find('textarea').val();
			if (paraText) {
				result.about.push({body: paraText});
			}
		}
	});
	// extract chapters
	$('#chapters-form tr').each(function(ind, element) {
		if (!$(element).find('.del').is(':checked')) {
			var resItem = {};
			$(element).find('.item').each(function(itemInd, item) {
				resItem[$(item).data('type')] = $(item).val();
			});
			if (resItem.hasOwnProperty('school') && resItem.hasOwnProperty('year')) {
				result.chapters.push(resItem);
			}
		}
	});
	// extract contact
	$('#contact-form tr').each(function(ind, element) {
		if (!$(element).find('.del').is(':checked')) {
			var resItem = {};
			$(element).find('.item').each(function(itemInd, item) {
				resItem[$(item).data('type')] = $(item).val();
			});
			if (resItem.hasOwnProperty('fieldname') && resItem.hasOwnProperty('fieldvalue')) {
				result.contact.push(resItem);
			}
		}
	});
	var resultString = JSON.stringify(result);
	authenticateFb('update&upData=' + resultString, function(response) {
		console.log(response);
		destroyModal();
	});
}

function loadTemplate($destination, selector, filename, data, callback) {
	$destination.load('templates/' + filename + ' ' + selector,
	function(response, status, xhr) {
		$destination.html(Mustache.render($destination.text(), data));
		callback();
	});
}