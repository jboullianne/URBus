const router 	= require('express').Router();
const db 		= require('./db_tools');

//Middleware To Cache Requests From Clients
var apicache 	= require('apicache');
var cache 		= apicache.middleware;

var unirest 	= require('unirest');
var path 		= require('path');

var directions 	= require('./directions');


// Twilio Credentials 
var accountSid = 'ACad272d651a8326e184bd69d76a7882f1'; 
var authToken = '2e6bb9d88d4897342352cf9607c9dd7a'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 



// router middleware that will happen on every request
router.use(function(req, res, next){
	console.log(req.method, req.url);	//Log the request to the console
	next();	//Continue to next route
})

router.get('/', (req, res) => {
  	res.status(200);
});


/* ============ CLIENT-SIDE ENDPOINTS ============ */

//Test SMS Endpoint
router.get('/sms/:phone', (req, res) => {
	var phone = req.params.phone;
	client.messages.create({ 
	    to: phone, 
	    from: "+12403481169", 
	    body: "Test Twilio Message", 
	    //mediaUrl: "https://c1.staticflickr.com/3/2899/14341091933_1e92e62d12_b.jpg",  
	}, function(err, message) { 
	    console.log(message.sid); 
	});
	res.status(200).json({"success" : true});
});



/*	
	ABOUT: Contains a list of agencies, along with their properties.
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve.
*/
router.get('/agencies', cache("1 hour"), (req, res) => {
	console.log("^ Route Now Cached For 1 Hour.");
	
	var agencies = req.query.agencies;
	if(agencies){
		console.log("Agency = ", agencies);
		// GET SPECFIC AGENCIES BY ID
		unirest.get("https://transloc-api-1-2.p.mashape.com/agencies.json?agencies=" + agencies + "&callback=call")
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
		  //console.log(result.status, result.headers, result.body);
		  res.status(200).json({"agencies" : result.body});
		});
	}else{
		// GET ALL AGENCIES
		unirest.get("https://transloc-api-1-2.p.mashape.com/agencies.json?&callback=call")
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
		  //console.log(result.status, result.headers, result.body);
		  res.status(200).json({"agencies" : result.body});
		});
	}
});

/*	
	ABOUT: Contains a list of arrival estimates, separated by stops
	PARAMS:
		REQUIRED: (AT LEAST ONE)
			agencies	(STRING): A list of agency IDs for which to retrieve the arrival estimates, separated by commas. Defaults to __ (University of Rochester)
			routes 		(STRING): A list of route IDs for which to retrieve the arrival estimates, separated by commas.
			stops		(STRING): A list of stop IDs for which to retrieve the arrival estimates, separated by commas.
		OPTIONAL: NONE
			
*/
router.get('/estimates', cache('1 minute'), (req, res) => {
	console.log("^ Route Now Cached For 1 Minute.");

	var agencies 	= req.query.agencies;
	var routes 		= req.query.routes;
	var stops		= req.query.stops;

	if(!agencies && !routes & !stops){
		res.status(200).json({"estimates" : [] });
	}else{
		var url = "https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?callback=call";
		if(agencies){ url += "&agencies=" + agencies; }
		if(routes){ url += "&routes=" + routes; }
		if(stops){ url += "&stops=" + stops; }

		unirest.get(url)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
		  res.status(200).json({"estimates" : result.body });
		});
	}

});

/*	
	ABOUT: Contains a list of routes, along with properties of the routes (segments, names, types, is_active, etc...).
	PARAMS:
		REQUIRED: 
			agencies	(STRING): A list of agency IDs which to retrieve routes for.
		OPTIONAL: NONE
			
*/
router.get('/routes', cache("30 minutes"), (req, res) => {
	console.log("^ Route Now Cached For 30 Minutes.");
	
	var agencies = req.query.agencies;
	console.log(agencies);
	if(agencies){
		unirest.get("https://transloc-api-1-2.p.mashape.com/routes.json?callback=call&agencies=" + agencies)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
			res.status(200).json({"routes" : result.body });
		});
	}else{
		res.status(200).json({"routes" : []});
	}

});

/*	
	ABOUT: Contains a list of all the segments that are required to visualize a route.
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve segments for. Defaults to __ (University of Rochester)
			routes 		(STRING): A list of route IDs for which to retrieve segments for, seperated by commas.
*/
router.get('/segments', cache("30 minutes"), (req, res) => {
	console.log("^ Route Now Cached For 30 Minutes.");
	
	var agencies 	= req.query.agencies;
	var routes 		= req.query.routes;

	if(agencies){

		var url = "https://transloc-api-1-2.p.mashape.com/segments.json?callback=call&agencies=" + agencies;
		if(routes){ url += "&routes=" + routes; }

		unirest.get(url)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
			res.status(200).json({"segments" : result.body });
		});
	}else{
		res.status(200).json({"segments" : [] });
	}
});

/*	
	ABOUT: Contains a list of stops
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve stops for. Defaults to __ (University of Rochester) 
*/
router.get('/stops', cache("30 minutes"), (req, res) => {
	console.log("^ Route Now Cached For 30 Minutes.");
	
	var agencies = req.query.agencies;

	if(agencies){
		var url = "https://transloc-api-1-2.p.mashape.com/stops.json?callback=call&agencies=" + agencies;
		unirest.get(url)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
			res.status(200).json({"stops" : result.body });
		});
	}else{
		res.status(200).json({"stops" : [] });
	}
});

/*	
	ABOUT: Contains a list of vehicles, their properties, and their locations.
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs for which to retrieve the vehicles. Defaults to __ (University of Rochester) 
			routes 		(STRING): A list of route IDs for which to retrieve the vehicles, seperated by commas.
*/
router.get('/vehicles', (req, res) => {
	var agencies 	= req.query.agencies;
	var routes 		= req.query.routes;

	if(agencies){

		var url = "https://transloc-api-1-2.p.mashape.com/vehicles.json?callback=call&agencies=" + agencies;
		if(routes){ url += "&routes=" + routes; }

		unirest.get(url)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
			res.status(200).json({"vehicles" : result.body });
		});
	}else{
		res.status(200).json({"vehicles" : [] });
	}
});


/*	
	ABOUT: Makes a Geocode Request to the Google APIs
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			address	(STRING): An address to geocode
*/
router.get('/geocode/:address', cache('5 minutes'), (req, res) => {
	var address = req.params.address;
	directions.geocodeAddress(address, function(data){
		res.status(200).json({"geocode" : data});
	});
});

/*	
	ABOUT: Makes a Places Request to the Google APIs
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			query	(STRING): A search query to find a place in Google's Places Database
*/
router.get('/places/:query', cache('5 minutes'), (req, res) => {
	var query = req.params.query;
	directions.findPlaces(query, function(data){
		res.status(200).json({"places" : data});
	});
});

/*	
	ABOUT: Makes a Places AutoComplete Request to the Google APIs
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			query	(STRING): A search query to find a possible place in Google's Places Database
*/
router.get('/placesAutoComplete/:query', cache('1 minute'), (req, res) => {
	var query = req.params.query;
	directions.autoCompletePlace(query, function(data){
		res.status(200).json({"places" : data});
	});
});

/*	
	ABOUT: Finds directions between two locations using Google APIs
	PARAMS:
		REQUIRED: 
			origin		(String - comma pair) The LatLng Pair of the origin
			destination	(String - comma pair) The LatLng Pair of the destination
		OPTIONAL:
			departure_time	(Date | Number)
			arrival_time	(Date | Number)
*/
router.get('/gDirections/:origin/:destination', cache('1 minute'), (req, res) => {
	var origin = req.params.origin;
	var destination = req.params.destination;

	directions.directionsGoogle(origin, destination, function(data){
		res.status(200).json({"directions" : data});
	});
});


/* ============ END CLIENT-SIDE ENDPOINTS ============ */

// 404 Page
router.get('/*', (req, res) => {	
  	res.send("Whoops you 404'd!")
});

module.exports = router;