/*
	js/admin.js
	Includes functions for rendering the admin modal, and adding events
	to admin related elements
*/

// hides main website and launches admin modal
function renderModal($active) {
	authenticateFb('verify', function(response) {
		if (!response || response === null || response.status !== 'success') {
			// authentication failed, exit out of admin modal
			alert('you must be authenticated on facebook');
			destroyModal();
			return;
		}
		$('#container').prepend($('<div id=\"admin\"></div>'));
		$('#admin').hide();
		$('#admin').load('templates/admin.html #template-modal', function() {
			$('#admin').html(Mustache.render($('#admin').text(), {}));
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
		$('#admin form div:visible').hide();
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
		$('#admin form div:visible').hide();
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
		$('#admin form div:visible').hide();
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
		$('#admin form div:visible').hide();
		$('#about-form').show();
		$('#buttonHolder').show();
	});
	
	$('#admin #about').mouseenter(function(e) {
		$('#whiteBars #aboutBar').stop(true).animate({backgroundColor: "#F9F9F9"}, 300);
	});
	
	$('#admin #about').mouseleave(function(e){
		$('#whiteBars #aboutBar').stop(true).animate({backgroundColor: "#3E3E3E"}, 300);
	});
}

// TODO: implement behavior for the page-specific content update
// buttons (i.e. the insert, update, and remove buttons)
// CHECK THE GITHUB WIKI FOR THE ADMIN COMMAND WORKFLOW

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