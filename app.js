/*
	app.js
	this is our NodeJS server. It has two jobs: retrieve content from our MongoDB
	server. securely authenticate users before making updates to our MongoDB server
*/

/*
	Modules and Dependencies
*/
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var url = require('url');
var queryString = require('querystring');
var facebook = require('facebook-sdk');
var AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB({region: 'us-west-2'});
var FB = new facebook.Facebook({
	appId			: 	'1524386131129811',
	xfbml			: 	true,
	version		: 	'v2.0'
});

/*
	Server Variables
*/
var port = process.env.PORT || 8081;
var serve = serveStatic('.', {});
var fbPageId = '797627276956025';

/*
	Sends request to DynamoDB for all the content of a certain page
*/
function retrievePageContent(pagename) {

}

/*
	Sends update request to DynamoDB to update attributes for a certain page
*/
function performPageUpdate(pagename, input) {

}

/*
	Verfies that a user is an admin of a certain FB page
	Page ID is hard coded

	result object for auth-ing with Facebook:
		status 	: 	failure or success
		>> if (action == 'verify') the object also contains data for all the content
		pages	: 	(on success) an object
			about 		: 	data
			chapters 	: 	data
			contact 	: 	data
		bgs 	: 	(on success) an array of filenames
*/
function authFb(queryObj, callback) {
	var action = queryObj.action;
	var id = queryObj.id;
	var accessToken = queryObj.admin;
	FB.api('/' + id + '/accounts/', 'GET', {access_token: accessToken}, function(response) {
		if (!response || response.error || !response.data || response.data.length < 1) {
			callback({status: 'failure'});
		} else {
			for (var i = 0; i < response.data.length; i++) {
				if (response.data[i].id === fbPageId) {
					if (action === 'verify') {
						callback({status: 'success'});
					// ~~ IT IS POSSIBLE THAT WE COMBINE ALL OF THESE FLOWS INTO ONE ~~
					} else if (action === 'update') {
						// invoke update flow
					} else if (action === 'add') {
						// invoke add content flow
					} else if (action === 'remove') {
						// invoke remove content flow
					} else {
						callback({status: 'failure'});
					}
					return;
				}
			}
			callback({status: 'failure'});
		}
	})
}

/*
	Initialize HTTP server
	HTTP server must first parse any GET variable that it may receive
	Returns either HTML information or JSON object
*/
var server = http.createServer(function(req, res) {
	// check if there is a request for page content
	var queryObj = queryString.parse(url.parse(req.url).query);

	if (queryObj.hasOwnProperty('admin') && queryObj.hasOwnProperty('id')
			&& queryObj.hasOwnProperty('action')) {
		// handle request of authenticating an admin and then performing an action
		authFb(queryObj, function(data) {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		});
	} else if (queryObj.hasOwnProperty('page')) {
		// handle request for page content
		getContent(queryObj.page, function(data) {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		});
	} else if (queryObj.hasOwnProperty('bgs')) {
		// handle request for background filenames
		getFilenames(function(info) {
			var result = [];
			info.data.forEach(function(val) {
				result.push('graphics/' + val.filename + '.gif');
			});
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
		});
	} else {
		// no valid GET variables. just serve the HTML file to client.
		var done = finalhandler(req, res)
		serve(req, res, done)
	}
});

// Listen
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://localhost:' + port);