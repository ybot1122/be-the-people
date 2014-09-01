var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var url = require('url');
var queryString = require('querystring');
var mongo = require('mongojs');

var port = process.env.PORT || 8081;

// Serve up public/ftp folder
var serve = serveStatic('.', {});

function getContent(page, callback) {
	var database = mongo('be-the-people', ['content']);
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
	var database = mongo('be-the-people', ['bg']);
	database.bg.find(function(err, data) {
		if (err != null || data == null) {
			callback([]);
		} else {
			callback(data);
		}
	});
}

function authenticate(cred, callback) {
	var database = mongo('be-the-people', ['cred']);
	database.cred.findOne(function(err, data) {
		if (data == null || err != null) {
			// first-time password setup
		} else {
			var result = (cred === data.pass) ? {state: true} : {state: false};
			callback(result);
		}
	});
}

// Create server
var server = http.createServer(function(req, res) {
	// check if there is a request for page content
	var queryObj = queryString.parse(url.parse(req.url).query);

	if (queryObj.hasOwnProperty('admin')) {
		authenticate(queryObj.admin, function(status) {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(status));
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