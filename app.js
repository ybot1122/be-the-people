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
function retrievePageContent(callback) {
	var params = {
	  RequestItems: {
	    bethepeople: {
	      Keys: [
	        {pagename: {S: 'about'}},
	        {pagename: {S: 'chapters'}},
	      	{pagename: {S: 'contact'}}
	      ]
	    }
	  }
	};

	ddb.scan({TableName: 'bethepeople'}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
		  var res = data.Items;
		  res.sort(function(a, b) {
		    return a.pagename.S > b.pagename.S;
		  });
	  	var result = {
	  		about: res[0].content.L,
	  		chapters: res[1].content.L,
	  		contact: res[2].content.L
	  	}
	    callback({status: 'success', data: result});
		}
	});
}

/*
	Sends update request to DynamoDB to update attributes for a certain page
*/
function performPageUpdate(input) {
	var aboutInfo = [];
	for (var i = 0; i < input.about.length; i++){
	  aboutInfo[i] = {M: {'body': {S: input.about[i].body}}};
	}
	var aboutParams = {
	  Key: {
	    pagename: {S: 'about'}
	  },
	  TableName: 'bethepeople',
	  UpdateExpression: 'SET content = :val1',
	  ExpressionAttributeValues: {
	    ':val1': {L: aboutInfo}
	  }
	};

	ddb.updateItem(aboutParams, function(err, data) {
	  if (err) {
	    console.log(err);
	  } else {
	    console.log(data);
	  }
	});

	//This is for the contact page

	var contactInfo = [];
	for (var i = 0; i < input.contact.length; i++){
	  contactInfo[i] = {M: {'fieldname': {S: input.contact[i].fieldname}, 'fieldvalue': {S: input.contact[i].fieldvalue}}};
	}
	var contactParams = {
	  Key: {
	    pagename: {S: 'contact'}
	  },
	  TableName: 'bethepeople',
	  UpdateExpression: 'SET content = :val1',
	  ExpressionAttributeValues: {
	    ':val1': {L: contactInfo}
	  }
	};

	ddb.updateItem(contactParams, function(err, data) {
	  if (err) {
	    console.log(err);
	  } else {
	    console.log(data);
	  }
	});

	//This is for the chapters page

	var chapterInfo = [];
	for (var i = 0; i < input.chapters.length; i++){
	  chapterInfo[i] = {M: {'school': {S: input.chapters[i].school}, 'year': {S: input.chapters[i].year}}};
	}
	var chapterParams = {
	  Key: {
	    pagename: {S: 'chapters'}
	  },
	  TableName: 'bethepeople',
	  UpdateExpression: 'SET content = :val1',
	  ExpressionAttributeValues: {
	    ':val1': {L: chapterInfo}
	  }
	};

	ddb.updateItem(chapterParams, function(err, data) {
	  if (err) {
	    console.log(err);
	  } else {
	    console.log(data);
	  }
	});

	//This is for the background page

	var backgroundInfo = [];
	for (var i = 0; i < input.background.length; i++){
	  backgroundInfo[i] = {M: {'filename': {S: input.background[i].filename}}};
	}
	var backgroundParams = {
	  Key: {
	    pagename: {S: 'backgrounds'}
	  },
	  TableName: 'bethepeople',
	  UpdateExpression: 'SET content = :val1',
	  ExpressionAttributeValues: {
	    ':val1': {L: backgroundInfo}
	  }
	};

	ddb.updateItem(backgroundParams, function(err, data) {
	  if (err) {
	    console.log(err);
	  } else {
	    console.log(data);
	  }
	});
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
					} else if (action === 'update' && queryObj.hasOwnProperty('upData')) {
						// invoke update flow
						var upData = JSON.parse(queryObj.upData);
						callback({status: 'success'});
					} else {
						callback({status: 'failure'});
					}
				}
			}
			callback({status: 'failure'});
		}
	});
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
		retrievePageContent(function(result) {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
		});
	} else if (queryObj.hasOwnProperty('bgs')) {
		// handle request for background filenames
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end();
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