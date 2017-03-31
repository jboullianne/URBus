
var searchMarker;
var markers = []; // Markers for the busses current locations
var infowindows = [];


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
						 icon: getIcon(vehicle.route_id),
						 id: vehicle.vehicle_id,
						 title: routeTable[vehicle.route_id][1] // Long-Name is title
					});

					// Info Window for each bus icon
					var contentString = '<div id="content">' +
											'<div id="siteNotice">' +
											'</div>' +
											'<h5 id="firstHeading" class="firstHeading" style="color:#' + routeTable[vehicle.route_id][0] +
											';">' + routeTable[vehicle.route_id][1] + '</h5>' +
										'</div>';
					var infowindow = new google.maps.InfoWindow({
						content: contentString
					});

					// Show the label when icon is clicked on
					// marker.addListener('click', function() {
					// 	infowindow.open(map, marker);
					// });


					// Save marker for later updating (instead of recreating each time)
					markers.push(marker); // Add to list of markers
					infowindows.push(infowindow);
				}

				for(var x in markers) {
					markers[x].addListener('click', function() {
						infowindows[x].open(map, markers[x]);
					})
				}

			}
	});
}

// Returns the icon formatted properly with the correct color/size
function getIcon(id) {
	var icon = {
		path: "M77.695,208.593c-17.985,0-32.562,14.571-32.562,32.559c0,17.988,14.576,32.559,32.562,32.559 "+
			"c17.992,0,32.564-14.57,32.564-32.559C110.259,223.163,95.687,208.593,77.695,208.593z M77.695,255.306 "+
			"c-7.818,0-14.153-6.334-14.153-14.154c0-7.822,6.335-14.154,14.153-14.154c7.819,0,14.159,6.332,14.159,14.154 "+
			"C91.854,248.972,85.514,255.306,77.695,255.306z " +
			"M268.854,208.593c-17.986,0-32.561,14.571-32.561,32.559c0,17.988,14.574,32.559,32.561,32.559 "+
			"c17.992,0,32.564-14.57,32.564-32.559S286.846,208.593,268.854,208.593z M268.854,255.306c-7.818,0-14.154-6.334-14.154-14.154 "+
			"c0-7.822,6.336-14.154,14.154-14.154c7.82,0,14.16,6.332,14.16,14.154C283.014,248.972,276.674,255.306,268.854,255.306z "+
			"M330.998,76.741H38.915c-10.701,0-21.207,8.579-23.348,19.064L3.892,138.423C1.751,148.908,0,166.242,0,176.944v44.751 "+
			"c0,10.7,8.756,19.456,19.457,19.456h19.839c0-21.17,17.226-38.395,38.398-38.395c21.174,0,38.401,17.223,38.401,38.395h114.358 "+
			"c0-21.17,17.227-38.395,38.398-38.395c21.176,0,38.402,17.223,38.402,38.395h23.74c10.703,0,19.457-8.754,19.457-19.456V96.197 "+
			"C350.455,85.496,341.699,76.741,330.998,76.741z M80.856,158.836H35.512l7.186-17.019c1.254-2.97-0.137-6.394-3.106-7.648 "+
			"c-2.972-1.254-6.395,0.138-7.647,3.107l-8.91,21.103c-6.015-1.581-9.676-7.214-8.437-13.89l10.46-41.74 "+
			"c1.465-7.891,9.23-14.348,17.256-14.348h38.543L80.856,158.836L80.856,158.836z M167.439,158.836H92.53V88.401h74.909V158.836z "+
			" M254.021,158.836h-74.908V88.401h74.908V158.836z M338.523,144.244c0,8.026-6.566,14.593-14.594,14.593h-58.234V88.402h58.234 "+
			"c8.027,0,14.594,6.567,14.594,14.593V144.244z",
		fillColor: "#" + routeTable[id][0],
		fillOpacity: .95,
		anchor: new google.maps.Point(0,100),
      strokeWeight: 0,
      scale: .10
	};
	return icon;
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
