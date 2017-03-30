
var searchMarker;


$(document).ready(function(){

	console.log("Home.js Ready");

	$("#search-box").keydown(function(e){
		if(e.key == "Enter"){ //Search For Input
			searchPlace(encodeURIComponent($("#search-box").val() + " "),function(data){
				$("#search-suggestions").hide();
				var places = data.places;
				for(var x in places){
					var place = places[x];
					console.log(place);
					var name = place.name;
					var form_addr = place.formatted_address;
					var location = place.geometry.location;

					map.setCenter(location);

					//Info Window HTML
					var contentString = '<div id="content">' + 
											'<div id="siteNotice">' + 
											'</div>' + 
											'<h5 id="firstHeading" class="firstHeading">' + name + '</h5>' +
											'<small>' + form_addr + '</small>'+
										'</div>';

					var infowindow = new google.maps.InfoWindow({
						content: contentString
					});

					if(searchMarker){ searchMarker.setMap(null); }
					//Marker For Map
					searchMarker = new google.maps.Marker({
						position: location,
						map: map,
						title: name,
						animation: google.maps.Animation.DROP,
					});	

					//Open info Window and Add Listener
					infowindow.open(map, searchMarker);
					searchMarker.addListener('click', function() {
						infowindow.open(map, searchMarker);
					});

					
				}
			})
		}else{
			$.get( "/api/placesAutoComplete/" + encodeURIComponent($("#search-box").val() + " "), function( data ) {
				console.log("SUCCESS", data);
				var places = data.places;
				if(places.length > 0){
					$("#search-list").html("");
					$("#search-suggestions").show();

					for(var x in places){
						var place = places[x];
						var description = place.description;
						var item = "<li style=\"border-bottom: 1px solid grey;\">" + description + "</li>";

						if(description){
							$("#search-list").append(item);
						}
					}
				}else{
					$("#search-suggestions").hide();
				}
			});
		}

	});

	$("#search-bar-button").click(function(){
		searchPlace(encodeURIComponent($("#search-box").val() + " "),function(data){
				$("#search-suggestions").hide();
				var places = data.places;

				for(var x in places){
					var place = places[x];
					console.log(place);
					var name = place.name;
					var form_addr = place.formatted_address;
					var location = place.geometry.location;

					map.setCenter(location);

					//Info Window HTML
					var contentString = '<div id="content">' + 
											'<div id="siteNotice">' + 
											'</div>' + 
											'<h5 id="firstHeading" class="firstHeading">' + name + '</h5>' +
											'<small>' + form_addr + '</small>'+
										'</div>';

					var infowindow = new google.maps.InfoWindow({
						content: contentString
					});

					if(searchMarker){ searchMarker.setMap(null); }
					//Marker For Map
					searchMarker = new google.maps.Marker({
						position: location,
						map: map,
						title: name,
						animation: google.maps.Animation.DROP,
					});	

					//Open info Window and Add Listener
					infowindow.open(map, searchMarker);
					searchMarker.addListener('click', function() {
						infowindow.open(map, searchMarker);
					});

					
				}
		})
	});

	var markers = []; // Markers for the busses current locations
	initVehicles();	// Initializes all vehile markers on the map

	var vehicleUpdater = setInterval(function(){
		// Update location of all vehicles (busses)
		$.get( "/api/vehicles?agencies=283", function( data ) {
				console.log("SUCCESS", data);
				var vehicles = data.vehicles.data["283"];
				if(vehicles.length > 0) {
					for(var x in vehicles) {
						var vehicle = vehicles[x];
						var id = vehicle.vehicle_id;
						var newLocation = vehicle.location;
						// Find marker with matching ID and update it's position
						for(var marker in markers) {
							if(marker.title == id) {
								marker.position = newLocation;
							}
						}
				}
		});
	}, 2000);

});


var searchPlace = function(input, callback){
	$.get( "/api/places/" + input, function( data ) {
		var places = data.places;
		if(places.length > 0){
			callback(data);
		}
	});
}


// Initializes all vehile markers on the map
function initVehicles() {
	$.get( "/api/vehicles?agencies=283", function( data ) {
			console.log("SUCCESS", data);
			var vehicles = data.vehicles.data["283"];
			if(vehicles.length > 0){

				for(var vehicle in vehicles){
					var location = vehicle.location;

					var marker = new google.maps.Marker({
						 position: location,
						 map: map,
						 icon: "img/bus-side-view.svg",
						 title: vehicle.vehicle_id
					  });

					  markers.push(marker); // Add to list of markers
				}
			}
	});
}
