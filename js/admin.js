/*
	js/admin.js
	Includes functions for rendering the admin modal, and adding events
	to admin related elements
*/

// hides main website and launches admin modal
function renderModal($active, content) {
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
				$('#main').slideUp(1000, function() {
				$('#admin').slideDown(1000);
			});
		});
	});
}

// destroys the admin modal and restores the main website
function destroyModal() {
	$('#admin').slideUp(1000, 0.0, function() {
		$('#main').slideDown(1000);
		$('#admin').remove();
		loadContent(initializeCols);
	});
	$('#menu').fadeTo(500, 1.0);
}

// TODO: tell the admin-modal buttons what to do
function attachButtonBehavior() {
	$('#exit').click(function(e) {
		destroyModal();
	});

	$('#admin #exit').mouseenter(function(e) {
		$('#whiteBars #exitBar').stop(true).animate({backgroundColor : '#F9F9F9'}, 300);
	});

	$('#admin #exit').mouseleave(function(e){
		$('#whiteBars #exitBar').stop(true).animate({'background-color' : "#3E3E3E"}, 300);
	});

	$('#admin #background').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#admin #background').css('background-color', '#212121');
		$('#admin #chapters, #admin #contact, #admin #about').css('background-color', '#3E3E3E');
		$('#admin div[id*=-form]:visible').hide();
		$('#background-form').show();
		$('#buttonHolder').show();
	});

	$('#admin #background').mouseenter(function(e) {
		$('#whiteBars #backgroundBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});

	$('#admin #background').mouseleave(function(e){
		$('#whiteBars #backgroundBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});

	$('#admin #contact').click(function(e) {
		// loading admin controls for the contact page
		e.preventDefault();
		e.stopPropagation();
		$('#admin #contact').css('background-color', '#212121');
		$('#admin #chapters, #admin #about, #admin #background').css('background-color', '#3E3E3E');
		$('#admin div[id*=-form]:visible').hide();
		$('#contact-form').show();
		$('#buttonHolder').show();
	});

	$('#admin #contact').mouseenter(function(e) {
		$('#whiteBars #contactBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});

	$('#admin #contact').mouseleave(function(e){
		$('#whiteBars #contactBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});

	$('#admin #chapters').click(function(e) {
		// loading admin controls for the chapters page
		e.preventDefault();
		e.stopPropagation();
		$('#admin #chapters').css('background-color', '#212121');
		$('#admin #about, #admin #contact, #admin #background').css('background-color', '#3E3E3E');
		$('#admin div[id*=-form]:visible').hide();
		$('#chapters-form').show();
		$('#buttonHolder').show();
	});

	$('#admin #chapters').mouseenter(function(e) {
		$('#whiteBars #chaptersBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});

	$('#admin #chapters').mouseleave(function(e){
		$('#whiteBars #chaptersBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});

	$('#admin #about').click(function(e) {
		// loading admin controls for the about page
		e.preventDefault();
		e.stopPropagation();
		$('#admin #about').css('background-color', '#212121');
		$('#admin #chapters, #admin #contact, #admin #background').css('background-color', '#3E3E3E');
		$('#admin div[id*=-form]:visible').hide();
		$('#about-form').show();
		$('#buttonHolder').show();
	});

	$('#admin #about').mouseenter(function(e) {
		$('#whiteBars #aboutBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});

	$('#admin #about').mouseleave(function(e){
		$('#whiteBars #aboutBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});

	$('#adminSubmit').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		deliverUpdateObject();
	});

	$('#uploadImage').click(function(event) {
		event.preventDefault();
		window.open($(this).attr("href"), "popupWindow", "width=600, height=600, scrollbar=yes");
	});

	$('#addRowAbout').click(function() {
		var element = document.createElement("tr");
		var td = document.createElement("td");
		var text = document.createElement("textarea");
		text.attr('class', 'item');
		text.attr('data-type', 'body');
		td.append(text);
		element.append(td);
		var td2 = document.creatElement("td");
		var select = document.createElement("select");
		select.append("");


		/*
		var newRow = $('#contentRow');
		var tr = document.createElement("tr");
		tr.innerHTML = newRow[0].innerHTML;
		console.log(tr);
		$('#about-form table').append(tr);
		newRow = $('#submitInput');
		$('#about-form table').append(newRow);
		*/
	});
}

// a function that disables all input, button, and textarea components in admin modal
function restrictPage() {
	$('#admin input, #admin button, #admin textarea').prop('disabled', true);
	$('#admin-load').show();
}

// a function that enables all input, button, and textarea components in admin modal
function unrestrictPage() {
	$('#admin input, #admin button, #admin textarea').prop('disabled', false);
	$('#admin-load').hide();
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
