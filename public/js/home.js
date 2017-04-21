var searchMarker;
var searchMarkerB;
var markers = []; // Markers for the busses current locations
var infowindows = [];
var vehicleList = [];
var segmentList = [];
var polylineList = [];
var rawRouteData = {};
var routeTable = {};
var lastA = ""; // Last query for A (search both if both changed)
var lastB = ""; // Last query for B (search both if both changed)
var G = {};

var polylineA;
var polylineB;



//Consolidated Info
var routeTable = {};
var stopTable = {};
var segTable = {};
var vehicleTable = {};

var vehicleMarkerList = [];
var vehicleIWList = [];

var segPolylineList = [];

var stopMarkerList = [];


$(document).ready(function(){

  console.log("Home.js Ready");

  //Load All Needed Data on Page Load
  $.get("/api/routes?agencies=283", function(data) {
    var routeData = data.routes.data["283"];
    for(var x in routeData) {
      var route = routeData[x];
      // console.log(route);
      routeTable[route.route_id] = route;
    }

    $.get("/api/stops?agencies=283", function(data) {
      var stopData = data.stops.data;
      for(var x in stopData) {
        var stop = stopData[x];
        // console.log(route);
        stopTable[stop.stop_id] = stop;
      }

       $.get("/api/segments?agencies=283", function(data) {
        var segData = data.segments.data;
        for(var x in segData) {
          var seg = segData[x];
          segTable[x] = seg;
        }

        $.get("/api/vehicles?agencies=283", function(data) {
          var vehData = data.vehicles.data["283"];
          for(var x in vehData) {
            var veh = vehData[x];
            // console.log(route);
            vehicleTable[veh.vehicle_id] = veh;
          }
          initVehicles();
          buildRoutePaths();
          initStops();
        });
      });
    });
  });





  $("#search-box").keydown(function(e){
    if(e.key == "Enter"){ //Search For Input
      searchAclicked();

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

  $("#search-bar-button").click(searchAclicked);

  $("#expand-search").click(toggleBoth);

  $("#searchB").click(function() {
    $("#search-bar-buttonB").fadeIn(300);
    $("#search-A-bar").fadeOut(300);
    $("#search-bar-button").fadeOut(300);
  });
  $("#searchA").click(function() {
    $("#search-bar-button").fadeIn(300);
    $("#search-A-bar").fadeIn(300);
    $("#search-bar-buttonB").fadeOut(300);

  });

  $("#search-boxB").keydown(function(e){
      if(e.key == "Enter"){ //Search For Input
        searchBclicked();
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

  $("#search-bar-buttonB").click(searchBclicked);

  var vehicleUpdater = setInterval(function(){
    // Update location of all vehicles (busses)
    $.get( "/api/vehicles?agencies=283", function( data ) {
        // console.log("SUCCESS", data);
        var vehData = data.vehicles.data["283"];
        for(var x in vehData) {
          var veh = vehData[x];
          var id = veh.vehicle_id;
          var newLocation = veh.location;
          // console.log(newLocation);
          // Find marker with matching ID and update it's position
          for(var y in vehicleMarkerList) {
            var marker = vehicleMarkerList[y];
            if(marker.id == id) {
              marker.setPosition(newLocation);
            }
          }
        }
    });
  }, 1500);

  // Get the graph for route-finding
  $.get( "/api/busgraph", function( data ) {
    console.log(data);
    G = data;
  });



});

var infowindow;
var infowindowB;

// Initializes all vehile markers on the map
function initVehicles() {
  for(var x in vehicleTable){
    var vehicle = vehicleTable[x];
    initMarker(vehicle);
  }
}

// Initializes single vehicle marker
function initMarker(vehicle) {
  var marker = new SlidingMarker({
     position: vehicle.location,
     map: map, // Makes it appear on the map
     icon: getIcon(vehicle.route_id),
     id: vehicle.vehicle_id,
     title: routeTable[vehicle.route_id].long_name // Long-Name is title
  });

  // Info Window for each bus icon
  var contentString = '<div id="content">' +
              '<div id="siteNotice">' +
              '</div>' +
              '<h5 id="firstHeading" class="firstHeading" ' +
              // '<h5 id="firstHeading" class="firstHeading" style="color:#' + routeTable[vehicle.route_id].color +
              ';">' + routeTable[vehicle.route_id].long_name + '</h5>' +
            '</div>';
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  // Show the label when icon is clicked on
  marker.addListener('click', function() {
    for(var z in vehicleIWList) { // Hide others
      vehicleIWList[z].close();
    }
    infowindow.open(map, this);
  });

  vehicleMarkerList.push(marker); // Add to list of markers
  vehicleIWList.push(infowindow);
}

// Builds the PolyLines representing the bus routes
function buildRoutePaths() {

  for(var y in routeTable){
    var route = routeTable[y];

    for(var z in route.segments){
      var seg_id = route.segments[z][0];

      var line = new google.maps.Polyline({
          path: google.maps.geometry.encoding.decodePath(segTable[seg_id]),
          strokeColor: "#" + route.color,
          strokeOpacity: 1.0,
          strokeWeight: 2.0,
          title: route.long_name,
          segment_id: seg_id
      });
      line.setMap(map);
      segPolylineList.push(line);
    }
  }

}

function initStops(){
  for(var x in stopTable){
    var stop = stopTable[x];
  }
}

// Returns the icon formatted properly with the correct color/size
function getIcon(id) {
  if(routeTable[id] == undefined) {
    return;
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
    fillOpacity: .99,
    anchor: new google.maps.Point(150,125),
      strokeWeight: 0,
      scale: .10
  };
  return icon;
}

function hideAllRoutes(){
  for( var x in segPolylineList ){
    segPolylineList[x].setMap(null);
  }
}

function showAllRoutes(){
  for( var x in segPolylineList ){
    segPolylineList[x].setMap(map);
  }
}

function hideAllVehicles(){
  for( var x in vehicleMarkerList){
    vehicleMarkerList[x].setMap(null);
  }
}

function showAllVehicles(){
  for( var x in vehicleMarkerList){
    vehicleMarkerList[x].setMap(map);
  }
}


//// Searching ////

function searchAclicked() {
  $("#search-container-B").removeClass("hidden");
  $("#search-container-B").fadeIn(400);
  lastA = $("#search-box").val();
  if($("#search-boxB").val() != lastB) {
    searchBclicked();
  }
  searchPlace(encodeURIComponent($("#search-box").val() + " "),function(data){
      $("#search-suggestions").hide();
      var places = data.places;
      if(places.length > 0){
        var place = places[0];
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

        infowindow = new google.maps.InfoWindow({
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
        try {
        infowindowB.close();
        } catch(err) {}
        infowindow.open(map, searchMarker);
        searchMarker.addListener('click', function() {
          infowindow.open(map, searchMarker);
        });


      }
  })
}

function searchBclicked() {
  lastB = $("#search-boxB").val();
  if($("#search-box").val() != lastA) {
    searchAclicked();
  }
  searchPlace(encodeURIComponent($("#search-boxB").val() + " "),function(data){
      $("#search-suggestionsB").hide();
      var places = data.places;
      if(places.length > 0){
        var place = places[0];
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

        infowindowB = new google.maps.InfoWindow({
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
        try {
        infowindow.close();
        } catch(err) {}
        infowindowB.open(map, searchMarkerB);
        searchMarkerB.addListener('click', function() {
          infowindowB.open(map, searchMarkerB);
        });

        // console.log(searchMarker.position, searchMarkerB.position);
        var directions = getDirections(searchMarker.position, searchMarkerB.position, function(data){

          //Data contains directions from server
          //Display directions
          data = data.data;
          console.log("Directions from server: ", data);



          $("#results").html("");
          for(var x in data.directions){
            var directions = data.directions[x];

            var startAddress = directions.routes[0].legs[0].start_address;
            var endAddress = directions.routes[0].legs[0].end_address;

            if(x == 0){
              polylineA = new google.maps.Polyline({
                          path: google.maps.geometry.encoding.decodePath(directions.routes[0].overview_polyline.points),
                          strokeColor: "#4286f4",
                          strokeOpacity: 1.0,
                          strokeWeight: 4.0,
                          title: "ROUTE TO STOP"
                      });
                      polylineA.setMap(map);

                      $("#results").append("<div class='dir-step'><small>Starting from:</small></br><b>" + startAddress + "</b></div>");

                      $("#results").append("<ul>");
                      for(var x in directions.routes[0].legs[0].steps){
                        var step = directions.routes[0].legs[0].steps[x];
                        console.log("STEP:",step);
                        var dir_html = "<li>" + step.html_instructions + "  (" + step.distance.text + " : " + step.duration.text + ")" + "</li>";

                        $("#results").append(dir_html);
                      }
                      $("#results").append("</ul>");

                      //DELETE: TEMPORARY
                      $("#results").append("<div class='dir-step'>GET ON BUS (FILL WITH BUS INFO)</div>");

            }
            if(x == 1){
              polylineB = new google.maps.Polyline({
                          path: google.maps.geometry.encoding.decodePath(directions.routes[0].overview_polyline.points),
                          strokeColor: "#4286f4",
                          strokeOpacity: 1.0,
                          strokeWeight: 4.0,
                          title: "ROUTE FROM STOP"
                      });
                      polylineB.setMap(map);

                      $("#results").append("<div class='dir-step'>GET OFF BUS (FILL WITH BUS INFO)</div>");

                      $("#results").append("<ul>");
                      for(var x in directions.routes[0].legs[0].steps){
                        var step = directions.routes[0].legs[0].steps[x];
                        console.log("STEP:",step);
                        var dir_html = "<li>" + step.html_instructions + "  (" + step.distance.text + " : " + step.duration.text + ")" + "</li>";

                        $("#results").append(dir_html);
                      }
                      $("#results").append("</ul>");


                      $("#results").append("<div class='dir-step'><small>Final Destination:</small></br><b>" + endAddress + "</b></div>");
            }

          }
          $("#results").fadeIn(300);
          hideAllRoutes();
          hideAllVehicles();


        });

      }
  })
}

var searchPlace = function(input, callback){
  // $.get( "/api/places/" + input, function( data ) {
  $.get( "/api/places/" + input, function( data ) {
    var places = data.places;
    if(places.length > 0){
      callback(data);
    }
  });
}

function toggleBoth() {
  var searchB = $("#search-container-B");

  if(searchB.hasClass("hidden")) {
    searchB.hide();
    $("#search-bar-buttonB").hide();
    // $("#search-A-bar").fadeOut(200);
    // $("#search-bar-button").fadeOut(200);
    setTimeout(function() {
      $("#search-bar-buttonB").fadeIn(500);
    }, 200);
    searchB.removeClass("hidden");
    searchB.fadeIn(200);

  }
  else {
    searchB.fadeOut(300);
    $("#search-A-bar").fadeIn(200);
    $("#search-bar-button").fadeIn(200);
    setTimeout(function() {
      searchB.addClass("hidden");
    }, 400);
  }
}


// Gets the directions from any start point to any end point (not just stops)
function getDirections(start, end, callback) {
  // Convert start and end to Stop_IDs if neccessary (always for now)

  // Just use Lat/Lng pairs always, for now (until Stops shortcut front-end is implemented)
  var points = start.lat() + ":" + start.lng() + "," + end.lat() + ":" + end.lng();
  console.log("Points = " + points);

  $.get( "/api/closestStop?points=" + points, function( data ) {
    callback(data);
  });

  //MATT! YOU'RE DUMB! THE LINE BELOW THIS WILL NEVER PRINT ANYTHING OTHER THAN 'Undefined' lol
  // Get request to getClosestStop to get Stop_IDs closest to start and and
  // And ALSO the Google Directions from Start to Stop(Start) and for End too.

  var allDirections = {}; // Will be directly made into HTML
  // Add directions from start to Stop(start) (from getClosestStops endpoint)

	// HARDCODED FOR NOW, BUT WILL BE CLOSEST STOPS FROM THE ENDPOINT //

  // getDirectionsInternal(Stop(start)), Stop(end))
  var stopA = "4195960"; // (Spruce & Genny) Stop(A)_ID (ID of the closest stop to start)
  var stopB = "4178632"; // (Near Mt Hope) Stop(B)_ID (ID of the closest stop to end)
  var internalPath = getPath(stopA, stopB)[0];
  console.log(internalPath);
  // Find route in internalPath where enter = stopA
  // Then trace back the full path until exit = stopB

  // Add directions from start to Stop(end) (from getClosestStops endpoint)
  return allDirections;
}


var G = {}; // Vertices w edges in adjacency list representation (fastest)
// timeToNextStop = ETA(B) - ETA(A) from vehicles response



// Returns list of cases (which route to start on),
// each has estimates for all destinations from given src
function dijkstras(src) {
   var cases = [];
   var options = Object.keys(G[src]);
   for(var route in options) {
      cases.push(dijkstraInternal(src, G[src][options[route]]));
   }
  console.log("CASES", cases);

   return cases;
}

// Run for each possible starting route that passes through starting stop
function dijkstraInternal(src, initialRoute) {
  var estimates = {};
  var unvisited = [];
  var prev = {};
  var route = {}; // The route_ID taken to get to each stop_ID from src

   for(var v in G) {
      estimates[v] = 9999;
      unvisited.push(v);
   }
   estimates[src] = 0;
   route[src] = initialRoute;

   // console.log(initialRoute, G[src]);

   while(unvisited.length > 0) {
      // Pop v with min estimate[v] from unvisited
    var pop = popMin(estimates, unvisited);
      var v = pop[0];
    unvisited = pop[1];
      for(var u in G[v]) {
      // console.log(estimates[G[v][u]]);
         // console.log(src, v, G[v][u], route[v]); // next_id, route_id
         // Need to minimize the route transfers (getting off and on a bus)
         console.log(routeTable[route[v]].is_active);

         if(routeTable[route[v]].is_active) {
            if(G[v][u] == route[v]) {
           // console.log(u);
               // Following the same route as we got to v
               if(estimates[v] + 1 < estimates[u]) {
                  estimates[u] = estimates[v] + 1;
                  prev[u] = v;
                  route[u] = route[v];
               }
            }
            else {
               // Transferring a route, add 100 to cost b/c undesirable
               if(estimates[v] + 101 < estimates[u]) {
                  estimates[u] = estimates[v] + 101;
                  prev[u] = v;
                  route[u] = G[v][u];
               }
            }
         }
      }
   }
   return [estimates, prev, route];
}

// Util for Dijkstra's algorithm
// Removes and returns element w min estimate from unvisited
function popMin(estimates, unvisited) {
   var min = 99999;
   var best;
   var curr;
   for(var v in unvisited) {
      curr = estimates[unvisited[v]];
      if(curr < min) {
         min = curr;
         best = v;
      }
   }
   // console.log(unvisited[best], estimates[unvisited[best]]);
   var result = unvisited[best];
   unvisited.splice(best, 1);
   return [result, unvisited];
}

// Run every time a query is made
// Returns [path, estimate]
// (Estimate = 100 * Transfers + 1 * Stops) so 216 = 16 stops and 2 transfers
function getPath(src, dst) {
   var res = dijkstras(src);
   console.log(res);
   // console.log(res[0][0]);
   // Pick the best starting route, specific to A and B
   // Needs to be here b/c it depends on B and dijkstras calculates for all B
   var curr;
   var best;
   var min = 99999;
   for(var c in res) {
    console.log(res[c][0][dst]);

      curr = res[c][0][dst];
      if(curr < min) {
         best = res[c];
         min = curr;
      }
   }
   // Debugging
   if(best == undefined) {
      console.log("Unreachable!");
      return;
   }

   var ests = best[0];
   var prev = best[1];
   var route = best[2];
   // console.log("ROUTE: ", route, " ; BEST: ", best);

   // Trace back the path, printing the route
   curr = dst;
   var lastRoute = route[dst];
   var path = []; // List of [{route_id, enter, exit}] (usually will just be 1 triple)
   // Unless they had to make a transfer.
   // path[lastRoute] = {"exit": dst};
	path.push({"route_id": lastRoute, "exit": dst})
   while(curr != src) {
      curr = prev[curr]; // Increment
      if(route[curr] != lastRoute) {
         path[0].enter = curr; // Finish entry for the last one
			path.unshift({"route_id": route[curr], "exit": curr}); // Insert next to beginning
         // path[route[curr]] = {"exit": curr};
         lastRoute = route[curr]; // Update last route used
      }
   }

   path[0].enter = src; // Add entering the first segment
   console.log(src, dst, "SRC : DST");
   console.log("Path = ", path);

   return [path, ests[dst]]; // Returns [path, estimate]
}
