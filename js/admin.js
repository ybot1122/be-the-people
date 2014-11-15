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
			$('#admin').slideDown(1500);
			$('.infocolumn').slideUp(1000).fadeOut(1000);
		});
	});
}

// destroys the admin modal and restores the main website
function destroyModal() {
	$('#admin').slideUp(1000, 0.0, function() {
		$('.infocolumn').slideDown(1000).fadeIn(1000);
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
		restrictPage();
		$('#admin #background').css('background-color', '#212121');
		$('#admin #chapters, #admin #contact, #admin #about').css('background-color', '#3E3E3E');
		loadContent('background', function(data) {
	  		loadTemplate($('#adminContent div'), '#template-background', 'admin.html', data,
	  			function() {
				// queryServer('about');
				unrestrictPage();
	 		 });
		});
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
		restrictPage();
		$('#admin #contact').css('background-color', '#212121');
		$('#admin #chapters, #admin #about, #admin #background').css('background-color', '#3E3E3E');
		loadContent('contact', function(data) {
	  		loadTemplate($('#adminContent div'), '#template-contact', 'admin.html', data,
	  			function() {
				// queryServer('about');
				unrestrictPage();
	 		 });
		});
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
		restrictPage();
		$('#admin #chapters').css('background-color', '#212121');
		$('#admin #about, #admin #contact, #admin #background').css('background-color', '#3E3E3E');
		loadContent('chapters', function(data) {
	  		loadTemplate($('#adminContent div'), '#template-chapters', 'admin.html', data,
	  			function() {
				// queryServer('about');
				unrestrictPage();
	 		 });
		});
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
		restrictPage();
		$('#admin #about').css('background-color', '#212121');
		$('#admin #chapters, #admin #contact, #admin #background').css('background-color', '#3E3E3E');
		loadContent('about', function(data) {
	  		loadTemplate($('#adminContent div'), '#template-about', 'admin.html', data,
	  			function() {
				// queryServer('about');
				unrestrictPage();
	 		 });
		});
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