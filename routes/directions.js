

//Google Maps Client Library
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyASr9Xd3y1N73kuR6ks8AKpnKuLQ6sHx4I'
});

module.exports = {

	geocodeAddress: function(input, callback){
		googleMapsClient.geocode({
			address: input
		}, function(err, response) {
			if (!err) {
				callback(response.json.results);
			}
		});
	},

	findPlaces: function(query, callback){
		googleMapsClient.places({
			"query": query,
         	location: {lat: 43.128397, lng: -77.628681}
		}, function(err, response) {
			if(!err) {
				callback(response.json.results);
			}
		});
	},

	autoCompletePlace: function(query, callback){
		googleMapsClient.placesAutoComplete({
			input: query
		}, function(err, response) {
			console.log(err);
			if(!err) {
				callback(response.json.predictions);
			}
		});
	},
	directionsGoogle: function(origin, destination, callback){
		googleMapsClient.directions({
			origin: origin,
			destination: destination,
         mode: "walking"
		}, function(err, response) {
			console.log(err);
			if(!err) {
				callback(response.json);
			}
		});
	},

	distanceMatrix: function(origin, destination, callback){
		googleMapsClient.distanceMatrix({
			origins: origin,
			destinations: destination
		}, function(err, response) {
			console.log(err);
			if(!err) {
				callback(response.json);
			}
		});
	}
   ,

   closestStopMatrix: function(callback) {
      googleMapsClient.distanceMatrix({
         origins: [{
          "lat": 43.121343,
          "lng": -77.626055
        }],
         destinations: [{
          "lat": 43.125419,
          "lng": -77.628988
       }, {
          "lat": 43.159018,
          "lng": -77.601301
        }]
         // transit_mode: "walking"
      }, function(err, response) {
         if(!err) {
            callback(response.json);
         }
      });
   },

   photo: function(query, callback){
   	console.log("IN DIRECTIONS PHOTO;", query);
   		googleMapsClient.placesPhoto({
   			photoreference: query,
   			maxwidth: 400,
   		}, function(err, response){
   			console.log(repsonse);
   			if(!err){
   				
   				callback(response);
   			}
   			console.log("ERROR:", err);
   		});
   },

}
