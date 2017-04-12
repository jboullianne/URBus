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

var Graph = {};
var stop_list = [];
var stop_map = {};


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
router.get('/vehicles', cache("1.5 seconds"), (req, res) => {
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
router.get('/placesAutoComplete/:query', (req, res) => {
	var query = req.params.query;
	console.log("AUTOComplete:", query);
	/*
	directions.autoCompletePlace(query, function(data){
		res.status(200).json({"places" : data});
	});
	*/
	res.status(200).json({"places" : []});
});

/*
	ABOUT: Finds directions between two locations using Google APIs
	PARAMS:
		REQUIRED:
			origin_coord	(String - comma pair) The LatLng Pair of the origin
			dest_coord		(String - comma pair) The LatLng Pair of the destination

			or

			origin_name		(String) Name of Origin
			dest_name		(String) Name of Destination
		OPTIONAL: (Not Implemented Yet)
			departure_time	(Date | Number)
			arrival_time	(Date | Number)
*/
router.get('/gDirections', cache('1 minute'), (req, res) => {
	var origin 		= [req.query.origin_coord];
	var destination = [req.query.dest_coord];

	var start 	= req.query.origin_name;
	var end 	= req.query.dest_name;

	if(origin[0] && destination[0]){
		directions.directionsGoogle(origin, destination, function(data){
			res.status(200).json({"directions" : data});
		});
	}else{
		console.log(start,end);
		//Find The LAT/LNG Pairs to search distance
		res.status(200).json({"Data" : "Endpoint Not Implemented Yet..."});
	}


});

/*
	ABOUT: Finds distance between two locations using Google's Distance Matrix API
	PARAMS:
		REQUIRED:
			origin_coord	(String - comma pair) The LatLng Pair of the origin
			dest_coord		(String - comma pair) The LatLng Pair of the destination

			or

			origin_name		(String) Name of Origin
			dest_name		(String) Name of Destination
		OPTIONAL: (Not Implemented Yet)
			departure_time	(Date | Number)
			arrival_time	(Date | Number)
*/
router.get('/gDistance', cache('1 minute'), (req, res) => {
	var origin 		= [req.query.origin_coord];
	var destination = [req.query.dest_coord];

	var start 	= req.query.origin_name;
	var end 	= req.query.dest_name;

	if(origin[0] && destination[0]){
		directions.distanceMatrix(origin, destination, function(data){
			res.status(200).json({"distance" : data});
		});
	}else{
		console.log(start,end);
		//Find The LAT/LNG Pairs to search distance
		res.status(200).json({"Data" : "Endpoint Not Implemented Yet..."});
	}

});

function dist(lat1, lon1, lat2, lon2){
	var R = 6371e3; // metres
	var φ1 = lat1 * 3.14 / 180;
	var φ2 = lat2 * 3.14 / 180;
	var Δφ = (lat2-lat1) * 3.14 / 180;
	var Δλ = (lon2-lon1) * 3.14 / 180;

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d;
}

router.get('/closestStop', cache('1 minute'), (req, res) => {

	if(!req.query.points){
		res.status(200).json({"data" : "No Point Query Provided"});
		return;
	}
	var latlng_pairs = req.query.points.split(',').map(function(input){
		return input.replace(':', ',');
	});

	console.log("LAT/LNG", latlng_pairs);

	var point_keys = Object.keys(stop_map);

	var data = {};

	for(var x = 0; x<latlng_pairs.length; x++){
		var minDist = -1;
		var closestPair = {};

		var q = latlng_pairs[x].split(','); //Split LAt/LNG into parts

		for(var i=1; i< point_keys.length; i++){
			var p = point_keys[i].split(","); //Split active point into parts
			if(dist(p[0],p[1],q[0],q[1]) < minDist || minDist == -1) {
				minDist = dist(p,q);
				closestPair = {start: q[0] + "," + q[1], stop: p[0] + "," + p[1]};
			}
		}
		if(!data.stop_pairs){
			data.stop_pairs = [];
		}
		data.stop_pairs.push(closestPair);
	}

	console.log(data.stop_pairs[0].start);
	if(latlng_pairs.length == 1){
		console.log("finding directions", data.stop_pairs[0]);
		directions.directionsGoogle(data.stop_pairs[0].start, data.stop_pairs[0].stop, function(result){
			var googleDirections = [result];
			res.status(200).json({"data" : {"points" :data, "directions": googleDirections}});
		});
	}

	if(latlng_pairs.length == 2){
		console.log("finding directions", data.stop_pairs[0]);
		directions.directionsGoogle(data.stop_pairs[0].start, data.stop_pairs[0].stop, function(result){
			var googleDirections = [result];
			// directions.directionsGoogle(data.stop_pairs[0].start, data.stop_pairs[0].stop, function(result2){
			directions.directionsGoogle(data.stop_pairs[1].stop, data.stop_pairs[1].start, function(result2){
				googleDirections.push(result2);
				res.status(200).json({"data" : {"points" :data, "directions": googleDirections}});
			});
		});
	}





});

router.get('/busgraph', cache('1 minute'), (req, res) => {
	res.status(200).json(Graph);
});



router.get('/closestStopMatrix', cache('1 minute'), (req, res) => {
	directions.closestStopMatrix(function(data) {
		res.status(200).json({"data": data});
	});

});

/* ============ END CLIENT-SIDE ENDPOINTS ============ */

// 404 Page
router.get('/*', (req, res) => {
  	res.send("Whoops you 404'd!")
});

module.exports = router;




/* CONSTRUCT BUS GRAPH HERE / FUNCTIONS */
//var GraphMaker = require('graph-data-structure');

//var Graph = GraphMaker();


setupBusGraph();

function setupBusGraph(){
	console.log("Graph:", Graph);

	var agency = 283 //University of Rochester

	unirest.get("https://transloc-api-1-2.p.mashape.com/routes.json?callback=call&agencies=" + agency)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
			var routes = result.body.data['283'];
			//console.log("Routes: ", routes);

			for(var x in routes){
				var route = routes[x];

				var route_id 	= route.route_id;
				var stops 		= route.stops;

				for(var y=0; y<stops.length -1; y++){
					var stop = stops[y];
					var next = stops[y+1];

					if(Graph[stop]){
						console.log("Stop visited");
						Graph[stop][next] = route_id;
					}else{
						console.log("Not visited");
						Graph[stop] = {};
						Graph[stop][next] = route_id;
					}

					console.log("STOP: ", stop);
				}

				if(stops.length != 0){
					var stop = stops[stops.length-1];
					var next = stops[0];

					if(Graph[stop]){
						console.log("Stop visited");
						Graph[stop][next] = route_id;
					}else{
						console.log("Not visited");
						Graph[stop] = {};
						Graph[stop][next] = route_id;
					}
				}



			}

			console.log(Graph);
		});
}


/* END BUS GRAPH FUNCTIONS */

populateStops();

function populateStops(){
	var url = "https://transloc-api-1-2.p.mashape.com/stops.json?callback=call&agencies=283";
		unirest.get(url)
		.header("X-Mashape-Key", "1oUioRIEA1msh9uNwrByVr1TZMLpp1tD3F1jsnrJ4b0UUdx8ae")
		.header("Accept", "application/json")
		.end(function (result) {
			for(var x in result.body.data){// For each Stop
				var stop = result.body.data[x];

				var lat = stop.location.lat;
				var lng = stop.location.lng;

				stop_map[lat + "," + lng] = stop.stop_id;

			}
			console.log("KEYS:", Object.keys(stop_map));
	});
}
