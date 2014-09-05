var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var url = require('url');
var queryString = require('querystring');
var mongo = require('mongojs');
var facebook = require('facebook-sdk');
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
	result object for retrieving page content from database
		status 	: 	failure or success
		data	: 	(on success) an object
			about 		: 	an array of objects {body: string}
			chapters 	: 	an array of objects {school: string, year: string}
			contact 	: 	an array of objects {field: string, value: string}
*/
function getContent(page, callback) {
	var database = mongo(mongoServer, [page]);
	database.collection(page).find({}, function(err, data) {
		if (err != null || data === null) {
			callback({error: "Invalid page request!"});
		} else {
			callback(data);
		}
		database.close();
	});
}

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
	result object for retrieving filenames from database
		status 	: 	failure or success
		files 	: 	array of objects {filename: string, type: string}
*/
function getFilenames(callback) {
	var database = mongo(mongoServer, ['bg']);
	database.bg.find(function(err, data) {
		if (err != null || !data || data == null) {
			callback([]);
		} else {
			callback(data);
		}
	});
}

/*
	result object for auth-ing with Facebook:
		status 	: 	failure or success
		>> action = verify
		pages	: 	(on success) an object
			about 		: 	data
			chapters 	: 	data
			contact 	: 	data
		bgs 	: 	(on success) an array of filenames
		>> action = update
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
				if (response.data[i].id === '151789761537076') {
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

// Create server
var server = http.createServer(function(req, res) {
	// check if there is a request for page content
	var queryObj = queryString.parse(url.parse(req.url).query);

	if (queryObj.hasOwnProperty('admin') && queryObj.hasOwnProperty('id')
			&& queryObj.hasOwnProperty('action')) {
		authFb(queryObj, function(data) {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		});
	} else if (queryObj.hasOwnProperty('page')) {
		// handle get request for page content
		getContent(queryObj.page, function(data) {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		});
	} else if (queryObj.hasOwnProperty('bgs')) {
		// handle get request for background filenames
		getFilenames(function(data) {
			var result = [];
			data.forEach(function(val) {
				result.push('graphics/' + val.filename + '.gif');
			});
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
		});
	} else {
		// serve the files
		var done = finalhandler(req, res)
		serve(req, res, done)
	}
});

// Listen
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port);