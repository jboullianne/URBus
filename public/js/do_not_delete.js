
var vehicleList = [];
var segmentList = [];
var polylineList = {};
var rawRouteData = {};

var searchMarker;

$(document).ready(function(){

	console.log("Home.js Ready");

	initVehicles();	// Initializes all vehicle markers on the map

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
          infowindow.addListener('closeclick', function(){
            searchMarker.setMap(null);
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

  $("#directions-button").click(function(){
    console.log("GET DIRECTIONS CLICK");
  });

  
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
						for(var x in vehicleList) {
							var v = vehicleList[x]
							if(v.id == id) {
								v.marker.setPosition(newLocation);
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


// Initializes all vehicle markers on the map
function initVehicles() {
	$.get( "/api/vehicles?agencies=283", function( data ) {

      var vehicles = data.vehicles.data["283"];

      for(var x in vehicles){
        var vdata = vehicles[x];
        var vehicle = {};

        vehicle.id = vdata.vehicle_id;
        vehicle.route = vdata.route_id;
        vehicle.location = vdata.location;
        vehicle.name = vdata.call_name;
        vehicle.marker = new google.maps.Marker({
            position: vehicle.location,
            map: map,
            title: vehicle.name,
            icon: getIcon("#0000ff")
          });

        vehicleList.push(vehicle);

      }

      buildRoutePaths();
	});
}

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

// Returns the properly formatted icon with correct color
function getIcon(color) {
	var icon = {
		// Credit to http://www.flaticon.com/free-icon/bus-side-view_61985
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
		fillColor: color, // Get color from table (below)
		fillOpacity: 1.0,
		anchor: new google.maps.Point(-0.25,-0.25), // Play around with this to make icons on the road
      strokeWeight: 0,
      scale: .10
	};
	return icon;
}

// Assosciates the route_id with the name, color, and path (locations)
var routeTable = {
 "4004546": {
  "name": "Scottsville Rd Lot",
  "color": "#fffc66",
  "path": [
   {
    "lat": 43.110547,
    "lng": -77.671584
   },
   {
    "lat": 43.109801,
    "lng": -77.672743
   },
   {
    "lat": 43.123348,
    "lng": -77.627488
   },
   {
    "lat": 43.122275,
    "lng": -77.621522
   },
   {
    "lat": 43.121599,
    "lng": -77.626247
   },
   {
    "lat": 43.121343,
    "lng": -77.626055
   },
   {
    "lat": 43.122972,
    "lng": -77.621431
   }
  ]
 },
 "4004558": {
  "name": "Corporate Woods",
  "color": "#694489",
  "path": [
   {
    "lat": 43.121874,
    "lng": -77.626116
   },
   {
    "lat": 43.11787,
    "lng": -77.622429
   },
   {
    "lat": 43.104704,
    "lng": -77.621737
   },
   {
    "lat": 43.107471,
    "lng": -77.619386
   },
   {
    "lat": 43.109179,
    "lng": -77.621115
   },
   {
    "lat": 43.108589,
    "lng": -77.621941
   },
   {
    "lat": 43.107061,
    "lng": -77.622115
   }
  ]
 },
 "4004562": {
  "name": "MC Staff",
  "color": "#2de3e0",
  "path": [
   {
    "lat": 43.121871,
    "lng": -77.62373
   },
   {
    "lat": 43.121874,
    "lng": -77.626116
   },
   {
    "lat": 43.121437,
    "lng": -77.628244
   },
   {
    "lat": 43.121272,
    "lng": -77.629944
   },
   {
    "lat": 43.119742,
    "lng": -77.629451
   },
   {
    "lat": 43.118285,
    "lng": -77.627919
   },
   {
    "lat": 43.119608,
    "lng": -77.627082
   },
   {
    "lat": 43.122972,
    "lng": -77.621431
   }
  ]
 },
 "4005038": {
  "name": "Goler-Whipple Shuttle",
  "color": "#0c010f",
  "path": []
 },
 "4006218": {
  "name": "College Town Express",
  "color": "#1ba0a0",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.125419,
    "lng": -77.628988
   },
   {
    "lat": 43.123348,
    "lng": -77.627488
   },
   {
    "lat": 43.12343,
    "lng": -77.618432
   },
   {
    "lat": 43.123224,
    "lng": -77.619391
   }
  ]
 },
 "4006658": {
  "name": "Admissions",
  "color": "#ffabf9",
  "path": []
 },
 "4007436": {
  "name": "City of Rochester Tour",
  "color": "#808080",
  "path": []
 },
 "4007476": {
  "name": "Highland Hospital",
  "color": "#f00c93",
  "path": [
   {
    "lat": 43.13565,
    "lng": -77.606525
   },
   {
    "lat": 43.122972,
    "lng": -77.621431
   }
  ]
 },
 "4008380": {
  "name": "Red Line",
  "color": "#ff0000",
  "path": [
   {
    "lat": 43.159018,
    "lng": -77.601301
   },
   {
    "lat": 43.128696,
    "lng": -77.627965
   }
  ]
 },
 "4008382": {
  "name": "Blue Line",
  "color": "#0f29f2",
  "path": [
   {
    "lat": 43.108495,
    "lng": -77.635829
   },
   {
    "lat": 43.11335,
    "lng": -77.634008
   },
   {
    "lat": 43.117282,
    "lng": -77.630838
   },
   {
    "lat": 43.121343,
    "lng": -77.626055
   },
   {
    "lat": 43.122972,
    "lng": -77.621431
   },
   {
    "lat": 43.123224,
    "lng": -77.619391
   },
   {
    "lat": 43.123348,
    "lng": -77.627488
   },
   {
    "lat": 43.125419,
    "lng": -77.628988
   },
   {
    "lat": 43.127748,
    "lng": -77.627076
   },
   {
    "lat": 43.131558,
    "lng": -77.624395
   },
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.122275,
    "lng": -77.621522
   }
  ]
 },
 "4008384": {
  "name": "Orange Line",
  "color": "#f07205",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.131558,
    "lng": -77.624395
   },
   {
    "lat": 43.141971,
    "lng": -77.604375
   },
   {
    "lat": 43.145931,
    "lng": -77.605566
   },
   {
    "lat": 43.148718,
    "lng": -77.597648
   },
   {
    "lat": 43.14583,
    "lng": -77.592509
   },
   {
    "lat": 43.146761,
    "lng": -77.573218
   },
   {
    "lat": 43.151356,
    "lng": -77.58002
   },
   {
    "lat": 43.154979,
    "lng": -77.594386
   },
   {
    "lat": 43.159018,
    "lng": -77.601301
   },
   {
    "lat": 43.136412,
    "lng": -77.614251
   }
  ]
 },
 "4008386": {
  "name": "Silver Line",
  "color": "#706868",
  "path": [
   {
    "lat": 43.120352,
    "lng": -77.632173
   },
   {
    "lat": 43.122653,
    "lng": -77.630412
   },
   {
    "lat": 43.125419,
    "lng": -77.628988
   },
   {
    "lat": 43.127748,
    "lng": -77.627076
   },
   {
    "lat": 43.131558,
    "lng": -77.624395
   },
   {
    "lat": 43.128696,
    "lng": -77.627965
   }
  ]
 },
 "4008388": {
  "name": "Gold Line - Riverview Direct",
  "color": "#a1a10b",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.130716,
    "lng": -77.636097
   },
   {
    "lat": 43.133543,
    "lng": -77.630596
   },
   {
    "lat": 43.131072,
    "lng": -77.635923
   },
   {
    "lat": 43.12825,
    "lng": -77.637275
   },
   {
    "lat": 43.125936,
    "lng": -77.631417
   }
  ]
 },
 "4008390": {
  "name": "Gold Line - 19th Ward",
  "color": "#a1a10b",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.125419,
    "lng": -77.628988
   },
   {
    "lat": 43.126292,
    "lng": -77.638938
   },
   {
    "lat": 43.126339,
    "lng": -77.642682
   },
   {
    "lat": 43.127275,
    "lng": -77.642698
   },
   {
    "lat": 43.128218,
    "lng": -77.642688
   },
   {
    "lat": 43.12915,
    "lng": -77.642736
   },
   {
    "lat": 43.130047,
    "lng": -77.64272
   },
   {
    "lat": 43.130998,
    "lng": -77.642768
   },
   {
    "lat": 43.13101,
    "lng": -77.641894
   },
   {
    "lat": 43.131018,
    "lng": -77.640762
   },
   {
    "lat": 43.130971,
    "lng": -77.63889
   },
   {
    "lat": 43.130716,
    "lng": -77.636097
   },
   {
    "lat": 43.133543,
    "lng": -77.630596
   },
   {
    "lat": 43.130113,
    "lng": -77.636497
   },
   {
    "lat": 43.129221,
    "lng": -77.636856
   },
   {
    "lat": 43.12825,
    "lng": -77.637275
   },
   {
    "lat": 43.127334,
    "lng": -77.63794
   }
  ]
 },
 "4008392": {
  "name": "Green Line - Pittsford Plaza",
  "color": "#07910c",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.125419,
    "lng": -77.628988
   },
   {
    "lat": 43.124577,
    "lng": -77.617614
   },
   {
    "lat": 43.122103,
    "lng": -77.592407
   },
   {
    "lat": 43.126402,
    "lng": -77.564582
   },
   {
    "lat": 43.112568,
    "lng": -77.550023
   },
   {
    "lat": 43.103917,
    "lng": -77.540517
   }
  ]
 },
 "4008394": {
  "name": "Green Line - College Town & Tops",
  "color": "#07910c",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.123224,
    "lng": -77.619391
   },
   {
    "lat": 43.122103,
    "lng": -77.592407
   }
  ]
 },
 "4008396": {
  "name": "Green Line - Marketplace",
  "color": "#07910c",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.104402,
    "lng": -77.627839
   },
   {
    "lat": 43.10025,
    "lng": -77.629958
   },
   {
    "lat": 43.090539,
    "lng": -77.640923
   },
   {
    "lat": 43.084765,
    "lng": -77.634432
   },
   {
    "lat": 43.082916,
    "lng": -77.627812
   },
   {
    "lat": 43.078061,
    "lng": -77.631846
   },
   {
    "lat": 43.080063,
    "lng": -77.624508
   },
   {
    "lat": 43.08337,
    "lng": -77.624792
   },
   {
    "lat": 43.117282,
    "lng": -77.630838
   }
  ]
 },
 "4008398": {
  "name": "Green Line - Public Market",
  "color": "#07910c",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.131558,
    "lng": -77.624395
   },
   {
    "lat": 43.108495,
    "lng": -77.635829
   },
   {
    "lat": 43.159018,
    "lng": -77.601301
   },
   {
    "lat": 43.165909,
    "lng": -77.590765
   }
  ]
 },
 "4009446": {
  "name": "Orange/Blue Line",
  "color": "#b600ff",
  "path": [
   {
    "lat": 43.128696,
    "lng": -77.627965
   },
   {
    "lat": 43.125419,
    "lng": -77.628988
   },
   {
    "lat": 43.123224,
    "lng": -77.619391
   },
   {
    "lat": 43.122937,
    "lng": -77.621373
   },
   {
    "lat": 43.121343,
    "lng": -77.626055
   },
   {
    "lat": 43.117282,
    "lng": -77.630838
   },
   {
    "lat": 43.11335,
    "lng": -77.634008
   },
   {
    "lat": 43.108495,
    "lng": -77.635829
   },
   {
    "lat": 43.127748,
    "lng": -77.627076
   },
   {
    "lat": 43.131558,
    "lng": -77.624395
   },
   {
    "lat": 43.141971,
    "lng": -77.604375
   },
   {
    "lat": 43.145931,
    "lng": -77.605566
   },
   {
    "lat": 43.148718,
    "lng": -77.597648
   },
   {
    "lat": 43.14583,
    "lng": -77.592509
   },
   {
    "lat": 43.146761,
    "lng": -77.573218
   },
   {
    "lat": 43.151356,
    "lng": -77.58002
   },
   {
    "lat": 43.154979,
    "lng": -77.594386
   },
   {
    "lat": 43.159018,
    "lng": -77.601301
   },
   {
    "lat": 43.136412,
    "lng": -77.614251
   }
  ]
 }
};
