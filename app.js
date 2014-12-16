/*
	app.js
	this is our NodeJS server. It has two jobs: retrieve content from our MongoDB
	server. securely authenticate users before making updates to our MongoDB server
*/

var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var url = require('url');
var queryString = require('querystring');
var mongo = require('mongojs');
var facebook = require('facebook-sdk');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

var FB = new facebook.Facebook({
	appId		: 	'1524386131129811',
	xfbml		: 	true,
	version		: 	'v2.0'
});

var port = process.env.PORT || 8081;

// Serve up public/ftp folder
var serve = serveStatic('.', {});
var mongoServer = 'bep:temp@54.68.27.92:27017/be-the-people';

/*
	These functions are to be invoked with a callback function. Each callback function
	is expecting to receive a JSON object of the following format:
		status 	: 	failure or success
		data	: 	(on success) an array of JSON objects of the one of the following formats:
			-> about 		: 	{_id: ObjectID, body: string}
			-> chapters 	: 	{_id: ObjectID, school: string, year: string}
			-> contact 		: 	{_id: ObjectID, field: string, value: string}
			-> backgrounds	: 	{_id: ObjectID, filename: string, type: string}
*/
function getContent(page, callback) {
	var database = mongo(mongoServer, [page]);
	database.collection(page).find({}, function(err, data) {
		if (err != null || data === null) {
			callback({status: 'failure'});
		} else {
			callback({
				status 	: 	'success',
				data 	: 	data
			});
		}
		database.close();
	});
}

function getFilenames(callback) {
	var database = mongo(mongoServer, ['bg']);
	database.bg.find(function(err, data) {
		if (err != null || !data || data == null) {
			callback({status: 'failure'});
		} else {
			callback({
				status 	: 	'success',
				data 	: 	data
			});
		}
	});
}

/*
	These functions perform updates and removal procedures on our database. It is imperative
	that these functions only be invoked if the client is authenticated. Currently these functions
	do not check for failure, so we (for now!) assume that each database operation succeeds.
*/
function updateContent(queryObj) {
	if (queryObj.hasOwnProperty('page')) {
		var database = mongo(mongoServer, [queryObj.page]);
		var obj = JSON.parse(queryObj.obj);
		obj._id = mongo.ObjectId(obj._id);
		database.collection(queryObj.page).update({_id: obj._id}, obj, 
			{upsert: false, multi: false});
	}
}

function removeContent(queryObj) {
	if (queryObj.hasOwnProperty('page')) {
		var database = mongo(mongoServer, [queryObj.page]);
		var obj = JSON.parse(queryObj.obj);
		obj._id = mongo.ObjectId(obj._id);
		database.collection(queryObj.page).remove({_id: obj._id}, {justOne: true});
	}
}

function addContent(queryObj) {
	if (queryObj.hasOwnProperty('page')) {
		var database = mongo(mongoServer, [queryObj.page]);
		var obj = JSON.parse(queryObj.obj);
		database.collection(queryObj.page).insert(obj, {});
	}
}

/*
	The authFB function is how our server verfies that a user is an admin of a certain FB page.
	Notice the page ID is hard-coded in. 

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
				if (response.data[i].id === '797627276956025') {
					if (action === 'verify') {
						callback({status: 'success'});
					} else if (action === 'update') {
						updateContent(queryObj);
						callback({status: 'success'});
					} else if (action === 'add') {
						addContent(queryObj);
						callback({status: 'success'});
					} else if (action === 'remove') {
						removeContent(queryObj);
						callback({status: 'success'});
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
	This is where we initialize our HTTP server. Our HTTP server must first parse any GET variable
	that it may receive. Depending on the GET variables passed, the server will either return
	an HTML page OR a JSON object. 
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