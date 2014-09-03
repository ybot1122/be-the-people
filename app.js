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

function getContent(page, callback) {
	var database = mongo(mongoServer, ['content']);
	database.content.findOne({pid: page}, function(err, data) {
		if (err != null || data == null) {
			callback({error: "Invalid page request!"});
		} else {
			callback(data.data);
		}
		database.close();
	});
}

function getFilenames(callback) {
	var database = mongo(mongoServer, ['bg']);
	database.bg.find(function(err, data) {
		if (err != null || data == null) {
			callback([]);
		} else {
			callback(data);
		}
	});
}

function authFb(id, accessToken, callback) {
	FB.api('/' + id + '/accounts/', 'GET', {access_token: accessToken}, function(response) {
		if (!response || response.error || !response.data || response.data.length < 1) {
			callback([]);
		} else {
			for (var i = 0; i < response.data.length; i++) {
				if (response.data[i].id === '151789761537076') {
					callback([true]);
				}
			}
			callback([]);
		}
	})
}

// Create server
var server = http.createServer(function(req, res) {
	// check if there is a request for page content
	var queryObj = queryString.parse(url.parse(req.url).query);

	if (queryObj.hasOwnProperty('admin') && queryObj.hasOwnProperty('id')) {
		authFb(queryObj.id, queryObj.admin, function(data) {
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