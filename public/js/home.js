var searchMarker;
var searchMarkerB;
var markers = []; // Markers for the busses current locations
var infowindows = [];
var vehicleList = [];
var segmentList = [];
var polylineList = {};
var rawRouteData = {};
var routeTable = {};


$(document).ready(function(){

	console.log("Home.js Ready");
	initVehicles();	// Initializes all vehile markers on the map


	$.get("/api/routes?agencies=283", function(data) {
		var allRoutes = data.routes.data["283"];
		for(var x in allRoutes) {
			var route = allRoutes[x];
			// console.log(route);
			routeTable[route.route_id] = {color: route.color, name: route.long_name};
		}
	})


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
				// console.log("SUCCESS", data);
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
					// console.log(place);
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

	$("#expand-search").click(function() {
		var searchB = $("#search-container-B");
		if(searchB.hasClass("hidden")) {
			searchB.removeClass("hidden");
		}
		else {
			searchB.addClass("hidden");
		}
	});


		$("#search-boxB").keydown(function(e){
			if(e.key == "Enter"){ //Search For Input
				searchPlace(encodeURIComponent($("#search-boxB").val() + " "),function(data){
					$("#search-suggestionsB").hide();
					var places = data.places;
					for(var x in places){
						var place = places[x];
						console.log(place);
						var name = place.name;
						var form_addr = place.formatted_address;
						var location = place.geometry.location;

						map.setCenter(location);

						//Info Window HTML
						var contentString = '<div id="contentB">' +
												'<div id="siteNoticeB">' +
												'</div>' +
												'<h5 id="firstHeading" class="firstHeading">' + name + '</h5>' +
												'<small>' + form_addr + '</small>'+
											'</div>';

						var infowindowB = new google.maps.InfoWindow({
							content: contentString
						});

						if(searchMarkerB){ searchMarkerB.setMap(null); }
						//Marker For Map
						searchMarkerB = new google.maps.Marker({
							position: location,
							map: map,
							title: name,
							animation: google.maps.Animation.DROP
						});

						//Open info Window and Add Listener
						// infowindowB.open(map, searchMarker);
						searchMarkerB.addListener('click', function() {
							infowindowB.open(map, searchMarker);
						});

						console.log(searchMarker.position, searchMarkerB.position);
						// API call for directions

					}
				})
			}else{
				$.get( "/api/placesAutoComplete/" + encodeURIComponent($("#search-boxB").val() + " "), function( data ) {
					// console.log("SUCCESS", data);
					var places = data.places;
					if(places.length > 0){
						$("#search-listB").html("");
						$("#search-suggestionsB").show();

						for(var x in places){
							var place = places[x];
							var description = place.description;
							var item = "<li style=\"border-bottom: 1px solid grey;\">" + description + "</li>";

							if(description){
								$("#search-listB").append(item);
							}
						}
					}else{
						$("#search-suggestionsB").hide();
					}
				});
			}

		});

		$("#search-bar-buttonB").click(function(){
			searchPlace(encodeURIComponent($("#search-boxB").val() + " "),function(data){
					$("#search-suggestionsB").hide();
					var places = data.places;
					for(var x in places){
						var place = places[x];
						// console.log(place);
						var name = place.name;
						var form_addr = place.formatted_address;
						var location = place.geometry.location;

						map.setCenter(location);

						//Info Window HTML
						var contentString = '<div id="contentB">' +
												'<div id="siteNoticeB">' +
												'</div>' +
												'<h5 id="firstHeading" class="firstHeading">' + name + '</h5>' +
												'<small>' + form_addr + '</small>'+
											'</div>';

						var infowindowB = new google.maps.InfoWindow({
							content: contentString
						});

						if(searchMarkerB){ searchMarkerB.setMap(null); }
						//Marker For Map
						searchMarkerB = new google.maps.Marker({
							position: location,
							map: map,
							title: name,
							animation: google.maps.Animation.DROP,
						});

						//Open info Window and Add Listener
						// infowindowB.open(map, searchMarker);
						searchMarkerB.addListener('click', function() {
							infowindowB.open(map, searchMarker);
						});

						console.log(searchMarker.position, searchMarkerB.position);
						// API call for directions

					}
			})
		});


	var vehicleUpdater = setInterval(function(){
		// Update location of all vehicles (busses)
		$.get( "/api/vehicles?agencies=283", function( data ) {
				// console.log("SUCCESS", data);
				var vehicles = data.vehicles.data["283"];
				if(vehicles.length > 0) {
					for(var x in vehicles) {
						var vehicle = vehicles[x];
						var id = vehicle.vehicle_id;
						var newLocation = vehicle.location;
						// console.log(newLocation);
						// Find marker with matching ID and update it's position
						for(var y in markers) {
							var marker = markers[y];
							if(marker.id == id) {

								var diff = newLocation.lat - marker.position.lat() + (newLocation.lng - marker.position.lng());
								diff *= 1000;
								// console.log(diff);
								if(diff > -5 && diff < 5 && diff != 0) {
									marker.setPosition(newLocation);
									marker.setMap(map);
								}
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
			// console.log("SUCCESS", data);
			var vehicles = data.vehicles.data["283"];
			if(vehicles.length > 0){
				for(var x in vehicles){
					var vehicle = vehicles[x];
					var location = vehicle.location;
					console.log("location", location);

					initMarker(vehicle);
				}
			}

	for(var x in vehicles){
	  var vdata = vehicles[x];
	  var vehicle = {};

	  vehicle.id = vdata.vehicle_id;
	  vehicle.route = vdata.route_id;
	  vehicle.location = vdata.location;
	  vehicle.name = vdata.call_name;
	  vehicle.marker = new google.maps.Marker({
			position: vehicle.location,
			// map: map,
			title: vehicle.name,
			icon: getIcon(vehicle.route)
		 });

	  vehicleList.push(vehicle);

	}
});
	buildRoutePaths();

}


// Initializes single vehicle marker
function initMarker(vehicle) {
	var marker = new google.maps.Marker({
		 position: vehicle.location,
		 map: map, // Makes it appear on the map
		 icon: getIcon(vehicle.route_id),
		 id: vehicle.vehicle_id,
		 title: routeTable[vehicle.route_id].name // Long-Name is title
	});

	// Info Window for each bus icon
	var contentString = '<div id="content">' +
							'<div id="siteNotice">' +
							'</div>' +
							'<h5 id="firstHeading" class="firstHeading" style="color:#' + routeTable[vehicle.route_id].color +
							';">' + routeTable[vehicle.route_id].name + '</h5>' +
						'</div>';
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	// Show the label when icon is clicked on
	marker.addListener('click', function() {
		for(var z in infowindows) { // Hide others
			infowindows[z].close();
		}
		infowindow.open(map, this);
	});

	markers.push(marker); // Add to list of markers
	infowindows.push(infowindow);
}

// Builds the PolyLines representing the bus routes
function buildRoutePaths() {

  $.get( "/api/segments?agencies=283", function( data ) {

      var segments = data.segments.data;

      for(var x in segments){
        var sdata = segments[x];
        var seg = {};

        seg.id = x
        seg.points = google.maps.geometry.encoding.decodePath(sdata);

        segmentList.push(seg);

      }

      $.get( "/api/routes?agencies=283", function( data ) {

        var routes = data.routes.data["283"];


        for(var x in segmentList){
          var seg = segmentList[x];

          for(var y in routes){
            var route = routes[y];
            var color = route.color

            for(var z in route.segments){
              var s = route.segments[z][0];

              if(s == seg.id){
                var line = new google.maps.Polyline({
                    path: seg.points,
                    strokeColor: "#" + color,
                    strokeOpacity: 1.0,
                    strokeWeight: 2.0
                });

                polylineList[seg.id] = line;
                polylineList[seg.id].setMap(map);

              }else{
                //Nothing
              }
            }
          }
        }
      });
  });

}

// Returns the icon formatted properly with the correct color/size
function getIcon(id) {
	if(routeTable[id] == undefined) {
		console.log(id);
	}
	// SVG from http://www.flaticon.com/free-icon/bus-side-view_61985
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
		fillColor: "#" + routeTable[id].color,
		fillOpacity: .95,
		anchor: new google.maps.Point(150,-20),
      strokeWeight: 0,
      scale: .10
	};
	return icon;
}
