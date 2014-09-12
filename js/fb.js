var isLoaded = false;

window.fbAsyncInit = function() {
	FB.init({
		appId		: 	'1524386131129811',
		xfbml		: 	true,
		version		: 	'v2.0'
	});
	$('#auth').show();
	$('#auth').click(function(e) {
		$active = $('span[data-active=\"true\"]');
		$active.click();
		$('#menu').fadeTo(500, 0.0, function() {
			$('#menu').hide();
		});
		renderModal($active);
	});
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


// performs FB api queries to check if the current user is logged into facebook
// and has admin access to the page
function authenticateFb(action, callback) {
	FB.login(function(response) {
		if (!response || response.error || !response.authResponse) {
			console.log('login error');
			$('#menu').fadeTo(500, 1.0);
		} else {
			var req = '/?admin=' + response.authResponse.accessToken
					+ '&id=' + response.authResponse.userID + '&action=' + action;
			var request = $.ajax({
				url: req,
				type: 'GET',
				datatype: 'JSON'
			});

			request.done(function(data, msg) {
				if (!data || data == null || data.status !== 'success') {
					callback({error: 'you must be an admin of the facebook page'});
				} else {
					callback(data);
				}
			});

			request.fail(function(data, msg) {
				callback({error: 'database currently down - cannot verify admin access'});
			});
		}
	}, {scope: 'manage_pages'});
}