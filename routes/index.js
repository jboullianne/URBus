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


/* Example Endpoint Of getting information about a bus */
router.get('/bus', (req, res) => {
  	res.status(200).json({ bus: [ {id: 1, name: "Bus1"}, {id: 2, name: "Bus2"}]});
});

// 404 Page
router.get('/*', (req, res) => {	
  	res.send("Whoops you 404'd!")
});

module.exports = router;