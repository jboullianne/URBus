const router = require('express').Router();
var path = require('path');

// router middleware that will happen on every request
router.use(function(req, res, next){
	console.log(req.method, req.url);	//Log the request to the console
	next();	//Continue to next route
})

router.get('/', (req, res) => {
  	res.status(200);
});


/* ============ CLIENT-SIDE ENDPOINTS ============ */

/*	
	ABOUT: Contains a list of agencies, along with their properties.
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve.
*/
router.get('/agencies', (req, res) => {
  	res.status(200).json({"GET" : req.url, success: true});
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
router.get('/estimates', (req, res) => {
  	res.status(200).json({"GET" : req.url, success: true});
});

/*	
	ABOUT: Contains a list of routes, along with properties of the routes (segments, names, types, is_active, etc...).
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve routes for. Defaults to __ (University of Rochester)
*/
router.get('/routes', (req, res) => {
  	res.status(200).json({"GET" : req.url, success: true});
});

/*	
	ABOUT: Contains a list of all the segments that are required to visualize a route.
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve segments for. Defaults to __ (University of Rochester)
			routes 		(STRING): A list of route IDs for which to retrieve segments for, seperated by commas.
*/
router.get('/segments', (req, res) => {
  	res.status(200).json({"GET" : req.url, success: true});
});

/*	
	ABOUT: Contains a list of stops
	PARAMS:
		REQUIRED: NONE
		OPTIONAL:
			agencies	(STRING): A list of agency IDs which to retrieve stops for. Defaults to __ (University of Rochester) 
*/
router.get('/stops', (req, res) => {
  	res.status(200).json({"GET" : req.url, success: true});
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
  	res.status(200).json({"GET" : req.url, success: true});
});

/* ============ END CLIENT-SIDE ENDPOINTS ============ */

// 404 Page
router.get('/*', (req, res) => {	
  	res.send("Whoops you 404'd!")
});

module.exports = router;