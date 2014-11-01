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
		// TODO: make admin modal visible and functional
	});
}

// destroys the admin modal and restores the main website
function destroyModal() {
	$('#admin').fadeTo(500, 0.0, function() {
		$('#admin').remove();
	});
	$('#menu').fadeTo(500, 1.0);
}

// TODO: tell the admin-modal buttons what to do
function attachButtonBehavior() {
	$('#exit').click(function(e) {
		// exiting the modal
	});	

	$('#admin #contact').click(function(e) {
		// loading admin controls for the contact page
	});

	$('#admin #chapters').click(function(e) {
		// loading admin controls for the chapters page
	});

	$('#admin #about').click(function(e) {
		// loading admin controls for the about page
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