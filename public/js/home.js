
var searchMarker;
var markers = []; // Markers for the busses current locations


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
						for(var x in markers) {
							var marker = markers[x]
							if(marker.id == id) {
								marker.setPosition(newLocation);
							}
						}
					}
				}
		});
	}, 1500);

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
				for(var x in vehicles){
					var vehicle = vehicles[x];
					var location = vehicle.location;
					console.log("location", location);
					var marker = new google.maps.Marker({
						 position: location,
						 map: map, // Makes it appear on the map
						 //icon: "img/bus-side-view.svg",
						 id: vehicle.vehicle_id,
						 title: routeTable[vehicle.route_id][1] // Long-Name is title
					});

					// Info Window for each bus icon
					var contentString = '<div id="content">' +
											'<div id="siteNotice">' +
											'</div>' +
											'<h5 id="firstHeading" class="firstHeading style="color:#' + routeTable[vehicle.route_id][0] +
											'">' + routeTable[vehicle.route_id][1] + '</h5>' +
										'</div>';

					var infowindow = new google.maps.InfoWindow({
						content: contentString
					});

					// Show the label when icon is clicked on
					marker.addListener('click', function() {
						infowindow.open(map, marker);
					});

					// Save marker for later updating (instead of recreating each time)
					markers.push(marker); // Add to list of markers
				}
			}
	});
}

// Assosciates the route_id with the color and name of the line
var routeTable = {"4004546" : ["fffc66","Scottsville Rd Lot"],
						"4004558" : ["694489","Corporate Woods"],
						"4004562" : ["2de3e0","MC Staff"],
						"4005038" : ["0c010f","Goler-Whipple Shuttle"],
						"4006218" : ["1ba0a0","College Town Express"],
						"4006658" : ["ffabf9","Admissions"],
						"4007436" : ["808080","City of Rochester Tour"],
						"4007476" : ["f00c93","Highland Hospital"],
						"4008380" : ["ff0000","Red Line"],
						"4008382" : ["0f29f2","Blue Line"],
						"4008384" : ["f07205","Orange Line"],
						"4008386" : ["706868","Silver Line"],
						"4008388" : ["a1a10b","Gold Line - Riverview Direct"],
						"4008390" : ["a1a10b","Gold Line - 19th Ward"],
						"4008392" : ["07910c","Green Line - Pittsford Plaza"],
						"4008394" : ["07910c","Green Line - College Town & Tops"],
						"4008396" : ["07910c","Green Line - Marketplace"],
						"4008398" : ["07910c","Green Line - Public Market"],
						"4009446" : ["b600ff","Orange/Blue Line"]};
