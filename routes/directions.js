
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
			"query": query
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
	}
   //,
	// directionsGoogle: function(origin, destination, callback){
	// 	googleMapsClient.directions({
	// 		origin: origin,
	// 		destination: destination
	// 	}, function(err, response) {
	// 		console.log(err);
	// 		if(!err) {
	// 			callback(response.json);
	// 		}
	// 	});
	// }

}
