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

var shortcutA = 0;
var shortcutB = 0;


//Consolidated Info
var routeTable = {};
var stopTable = {};
var segTable = {};
var vehicleTable = {};
var estimatesTable = {};

//Current Route State (What's Being Painted On Map)
var routesDisplayed = [];


var vehicleMarkerList = [];
var vehicleIWList = [];

var segPolylineList = [];

var stopMarkerList = [];
var stopIWList = [];


$(document).ready(function(){

  console.log("Home.js Ready");
  // Animation JS
  $("head").append('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/marker-animate-unobtrusive/0.2.8/vendor/markerAnimate.js" async defer></script>');
  $("head").append('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/marker-animate-unobtrusive/0.2.8/SlidingMarker.min.js" async defer></script>');

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
          initStops();
          initVehicles();
          buildRoutePaths();

        });
      });
    });
  });


  $("#search-box").keydown(function(e){
   //  if(e.key == "Enter"){ //Search For Input
   shortcutA = 0; // They typed something, reset shortcut
    if(e.keyCode == 13){ //Search For Input
      resetSearchResults();
      searchAclicked(true);
      $("#search-boxB").focus();
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

  $("#search-bar-button").click(function() {
     searchAclicked(true);
  });

  $("#expand-search").click(toggleBoth);

  $("#searchB").click(function() {
    $("#search-bar-buttonB").fadeIn(300);
    $("#search-B-bar").fadeIn(300);
    $("#search-A-bar").fadeOut(300);
    $("#search-bar-button").fadeOut(300);

  });
  $("#searchA").click(function() {
    $("#search-bar-button").fadeIn(300);
    $("#search-A-bar").fadeIn(300);
    $("#search-bar-buttonB").fadeOut(300);
    $("#search-B-bar").fadeOut(300);
  });




  $("#search-boxB").keydown(function(e){
     shortcutB = 0; // They typed something, reset shortcut
      if(e.keyCode == 13){ //Search For Input
        resetSearchResults();
        searchBclicked();
      }else{
         $("#search-bar-buttonB").fadeIn(300);
         $("#search-B-bar").fadeIn(300);
         $("#search-A-bar").fadeOut(300);
         $("#search-bar-button").fadeOut(300);
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

  $("#swap").click(function() {
      if($("#search-box").val() != "" || $("#search-boxB").val() != "") {
         var temp = $("#search-boxB").val();
         $("#search-boxB").val($("#search-box").val());
         $("#search-box").val(temp);
         temp = shortcutA;
         shortcutA = shortcutB;
         shortcutB = temp;
         if($("#search-box").val() != "" && $("#search-boxB").val() != "") {
            searchBclicked();
      }
   }
});
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
  // Reverts to default view of only the active routes
  $("#reset-view").click(function() {
     map.setZoom(15);
     map.setCenter({lat: 43.128397, lng: -77.628681});
     showActiveRoutes();
 });

// Deselect all routes
 $("#uncheckAll").click(function() {
   hideAllRoutes();
});

// Help Button
$("#helpButton").tooltip({title: "Search any location (i.e. Chipotle, Rush Rhees, RIT) with the search bars on the top left to get directions using the UR Shuttle system! Hide and show routes with the panel on the right (Desktop only). Powered by Transloc and Google Maps.",
   placement: "top", trigger: "hover"});



// Clicking anywhere on Display On/Off bar shows/hides the body
 $("#displayPanelTop").click(function() {
    var temp = $("#closeSettings"); // The icon
    if(temp.hasClass("fa-close")) {
      temp.removeClass("fa-close");
      temp.addClass("fa-plus");
      $("#panelBody").fadeOut(300);
   }
   else {
      temp.removeClass("fa-plus");
      temp.addClass("fa-close");
      $("#panelBody").fadeIn(300);

   }
})

  $("#show-all-routes-btn").click(function(){
    $(".inactive-route").toggle();
    $(this).text(function(i, text){
      return text === "Show Inactive Routes" ? "Hide Inactive Routes" : "Show Inactive Routes";
    });
  });


});
//var infowindow;
//var infowindowB;

// Initializes all vehile markers on the map
function initVehicles() {
  for(var x in vehicleTable){
    var vehicle = vehicleTable[x];
    initVehicleMarker(vehicle);
  }
}

// Initializes single vehicle marker
function initVehicleMarker(vehicle) {
  var marker = new SlidingMarker({
     position: vehicle.location,
     map: map, // Makes it appear on the map
     icon: getIcon(vehicle.route_id),
     id: vehicle.vehicle_id,
     title: routeTable[vehicle.route_id].long_name, // Long-Name is title
     route_id: vehicle.route_id
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
    hideAllInfoWindows();
    infowindow.open(map, this);
  });

  vehicleMarkerList.push(marker); // Add to list of markers
  vehicleIWList.push(infowindow);
}

// Builds the PolyLines representing the bus routes
function buildRoutePaths() {

  for(var y in routeTable){
    var route = routeTable[y];
    if(route.is_active){
      routesDisplayed.push(route.route_id);
    }

    for(var z in route.segments){
      var seg_id = route.segments[z][0];

      var line = new google.maps.Polyline({
          path: google.maps.geometry.encoding.decodePath(segTable[seg_id]),
          strokeColor: "#" + route.color,
          strokeOpacity: 1.0,
          strokeWeight: 2.0,
          title: route.long_name,
          segment_id: seg_id,
          route_id: route.route_id,
          is_active: route.is_active
      });
      segPolylineList.push(line);
    }

    //Add Route to Route List Div On Page

    if(route.is_active){
      var html =  '<div class="checkbox">' +
                  '<label><input type="checkbox" class="route-checkbox-active" value="" checked id="route-handler' + route.route_id + '">' + route.long_name + '</label>' +
                '</div>';
      $("#route-list-div").append(html);
      $("#route-handler" + route.route_id).change(function(){
        var route_id = $(this).attr("id").replace("route-handler", "");
        if(this.checked){
          showRoute(route_id);
        }else{
          hideRoute(route_id);
        }
      })
    }else{
      var html =  '<div class="checkbox inactive-route" style="display: none;">' +
                  '<label><input type="checkbox" class="route-checkbox-inactive" value="" id="route-handler' + route.route_id + '">' + route.long_name + " (Inactive)" + '</label>' +
                '</div>';
      $("#route-list-div").append(html);
      $("#route-handler" + route.route_id).change(function(){
        var route_id = $(this).attr("id").replace("route-handler", "");
        if(this.checked){
          showRoute(route_id);
        }else{
          hideRoute(route_id);
        }
      })
    }

  }
  showActiveRoutes();
}

function initStops(){
  for(var x in stopTable){
    initStopMarker(stopTable[x]);
  }
}

function initStopMarker(stop){
  var marker = new SlidingMarker({
     position: stop.location,
     map: map, // Makes it appear on the map
     icon: getStopIcon(),
     id: stop.stop_id,
     title: stopTable[stop.stop_id].name
  });

  //console.log("STOP NAME:", stopTable[stop.stop_id].name);

  // Info Window for each bus icon
  var stopString = '<div id="content">' +
              '<div id="siteNotice">' +
              '</div>' +
              '<h5 id="firstHeading" class="firstHeading" style="text-align:center;">' + marker.title + '</h5>' +
              '<button id="' + stop.stop_id + '_to" class="btn btn-xs btn-primary">Directions To Here</button>&nbsp;' +
              '<button id="' + stop.stop_id + '_from" class="btn btn-xs btn-primary">Directions From Here</button>' +
              '<hr>' +
              '<div id="stop-estimates' + stop.stop_id + '">' +
              '</div>'+
            '</div>';
  var stopWindow = new google.maps.InfoWindow({
    content: stopString
  });

  // Show the label when icon is clicked on
  marker.addListener('click', function() {
     hideAllInfoWindows();
    console.log("STOPMARKER:", this);
    updateStopEstimates(this.id);
    stopWindow.open(map, this)


      console.log($("#content").html());

        $("#" + stop.stop_id + "_to").click(function() {
              console.log(stop.stop_id + "_to clicked!");
              $("#search-boxB").val(stopTable[stop.stop_id].name);
              hideAllInfoWindows();
              shortcutB = stop.stop_id;
              searchBclicked();
        });
        $("#" + stop.stop_id + "_from").click(function() {
            console.log(stop.stop_id + "_from clicked!");
            $("#search-box").val(stopTable[stop.stop_id].name);
            hideAllInfoWindows();
            shortcutA = stop.stop_id;
            searchBclicked();

       });


  });



  stopMarkerList.push(marker); // Add to list of markers
  stopIWList.push(stopWindow);
}

// Returns the icon formatted properly with the correct color/size
function getStopIcon() {

  // SVG from http://www.flaticon.com/free-icon/placeholder_175010
  var icon = {
    path: "M8 4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7z M8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8v0z",
    fillColor: "#3289C7",
    fillOpacity: .99,
    anchor: new google.maps.Point(0,0),
      strokeWeight: 0,
      scale: 1.0
  };
  return icon;
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

function updateStopEstimates(stop_id){

  $.get("/api/estimates?agencies=283&stops="+stop_id, function(data) {
      var estimates = data.estimates;
      console.log("ESTIMATES:", estimates);
      if(estimates.data.length == 0){
        $("#stop-estimates" + stop_id).html("<h5>No upcoming arrivals found.</h5>");
        return;
      }
      var arrivals = estimates.data[0].arrivals;

      //Creates Raw Estimate Data
      var edata = {};
      for(var x in arrivals){
          var arrival = arrivals[x];

          if(!edata[arrival.route_id]){
            edata[arrival.route_id] = [];
          }
          edata[arrival.route_id].push(arrival);
      }

      //Convert Raw Estimate Data To HTML
      var curr_time = new Date();
      var html = "<div style='overflow-y:scroll;'>";
      for(var x in edata){
        html += '<h5>'+ routeTable[edata[x][0].route_id].long_name + '</h5>';
        var counter = 0;
          for(var y in edata[x]){
             counter++;
             if(counter > 6) { // Shows next 6 for each route
                break;
             }
            console.log(edata[x][y]);
            var time_until = new Date(((new Date(edata[x][y].arrival_at)) - curr_time));
            var min = time_until.getMinutes();
            var hour = time_until.getHours() - 19;

            var parsed_time = "";
            if(hour > 0){
              parsed_time += hour + " hour ";
            }

            parsed_time += min + " min(s)";
            html += '<li style="list-style-type: inherit; padding-top: 0em;"><small>' + parsed_time + '</small></li>';
          }
      }
      html += "</div>";

      $("#stop-estimates" + stop_id).html(html);
  });
}



function hideAllRoutes(){
  for( var x in routeTable ){
    hideRoute(routeTable[x].route_id);
  }

  $('.route-checkbox-active').prop('checked', false);
  $('.route-checkbox-inactive').prop('checked', false);

}

function hideRoute(route_id){
  $("#route-handler" + route_id).prop('checked', false);

  var index = routesDisplayed.indexOf(route_id);
  if(index != -1){routesDisplayed.splice(index,1);}

  for( var x in segPolylineList ){
    if(segPolylineList[x].route_id == route_id)
      segPolylineList[x].setMap(null);
  }

  for( var x in vehicleMarkerList){
    if(vehicleMarkerList[x].route_id == route_id)
      vehicleMarkerList[x].setMap(null);
  }

  for( var x in stopMarkerList){
    var stop_id = stopMarkerList[x].id;

    var routes = stopTable[stop_id].routes;
    var stop_active = false;
    var stop_in_route = false;
    for(var y in routes){
      stop_in_route |= routes[y] == route_id;
      stop_active |= routesDisplayed.includes(routes[y]);
    }

    if(stop_in_route && !stop_active){
      // console.log("STOP:", stop_in_route, stop_active, stopMarkerList[x]);
      stopMarkerList[x].setMap(null);
    }

  }
}

function showRoute(route_id){
  $("#route-handler" + route_id).prop('checked', true);

  var index = routesDisplayed.indexOf(route_id);
  if(index == -1){routesDisplayed.push(route_id);}

  for( var x in segPolylineList ){
    if(segPolylineList[x].route_id == route_id)
      segPolylineList[x].setMap(map);
  }

  for( var x in vehicleMarkerList){
    if(vehicleMarkerList[x].route_id == route_id)
      vehicleMarkerList[x].setMap(map);
  }

  for( var x in stopMarkerList){
    var stop_id = stopMarkerList[x].id;

    var routes = stopTable[stop_id].routes;
    var stop_in_route = false;
    for(var y in routes){
      stop_in_route |= routes[y] == route_id;
    }

    if(stop_in_route){
      stopMarkerList[x].setMap(map);
    }
  }
}

function showAllRoutes(){
  for( var x in routeTable ){
    showRoute(routeTable[x].route_id);
  }

  $('.route-checkbox-active').prop('checked', true);
  $('.route-checkbox-inactive').prop('checked', true);

}

function showActiveRoutes(){
  for( var x in routeTable ){
    if(routeTable[x].is_active)
      showRoute(routeTable[x].route_id);
    else{
      hideRoute(routeTable[x].route_id);
     }
  }

  $('.route-checkbox-active').prop('checked', true)
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

function showStop(stop_id){
  for( var x in stopMarkerList){
    var id = stopMarkerList[x].id;

    if(stop_id == id){
      stopMarkerList[x].setMap(map);
      return;
    }
  }
}



function hideAllStops(stop_id){
  for( var x in stopMarkerList){
    stopMarkerList[x].setMap(null);
  }
}

function resetSearchResults(){
  if(polylineA){polylineA.setMap(null);}
  if(polylineB){polylineB.setMap(null);}

  if(searchMarker){searchMarker.setMap(null);}
  if(searchMarkerB){searchMarkerB.setMap(null);}

  showActiveRoutes();
}





//// Searching ////

function searchAclicked(will_center, callback) {
   $("#search-box").blur(); // Removes the keyboard on mobile
  $("#search-container-B").removeClass("hidden");
  $("#search-container-B").fadeIn(400);

  lastA = $("#search-box").val();

  searchPlace(encodeURIComponent($("#search-box").val() + " "),function(data){
      $("#search-suggestions").hide();
      var places = data.places;
      if(places.length > 0){
        var place = places[0];
        console.log(place);
        var name = place.name;
        var form_addr = place.formatted_address;
        var location = place.geometry.location;
        if(shortcutA != 0) {
           location = stopTable[shortcutA].location;
           name = stopTable[shortcutA].name;
           form_addr = "";
        }
      //   var reference = place.photos[0].photo_reference;

      //   $.get( "/api/photo/" + reference, function( data ) {
      //     console.log(data);
      //   });
        if(will_center){
          map.setCenter(location);
        }


        //Info Window HTML
        var contentString = '<div id="content" style="overflow: hidden;">' +
                              '<div class="row">' +
                                '<div class="col-md-3">' +
                                  '<img src=""></img>' +
                                '</div>' +
                                '<div class="col-md-9">' +
                                  '<h5 id="firstHeading" class="firstHeading">'+ name + '</h5>' +
                                  '<small>' + form_addr + '</small>' +
                                '</div>' +
                              '</div>' +
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
        hideAllInfoWindows();
        infowindow.open(map, searchMarker);
        searchMarker.addListener('click', function() {
           hideAllInfoWindows();
          infowindow.open(map, searchMarker);
        });


      }
      if(callback){callback();}
  })
  if($("#search-boxB").val() != "" && will_center) {
     console.log("Here");
    searchBclicked();
  }
  else if($("#search-boxB").val() != "" && $("#search-box").val() != "") {
   //   setTimeout(function() {
   // console.log("A: ", searchMarker.position);
   // console.log("B: ", searchMarkerB.position);

   //   getDirections(searchMarker.position, searchMarkerB.position, directionsCallback);
  // }, 1000);
  }
}

function searchBclicked() {
  lastB = $("#search-boxB").val();
   $("#search-boxB").blur(); // Removes the keyboard on mobile
  searchAclicked(false, function(){
    searchPlace(encodeURIComponent($("#search-boxB").val() + " "),function(data){
      $("#search-suggestionsB").hide();
      var places = data.places;
      if(places.length > 0){
        var place = places[0];
        // console.log(place);
        var name = place.name;
        var form_addr = place.formatted_address;
        var location = place.geometry.location;
        if(shortcutB != 0) {
           location = stopTable[shortcutB].location;
           name = stopTable[shortcutB].name;
           form_addr = "";
      }
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
        hideAllInfoWindows();
        infowindowB.open(map, searchMarkerB);
        searchMarkerB.addListener('click', function() {
           hideAllInfoWindows();
           infowindowB.open(map, searchMarkerB);
        });

        // console.log(searchMarker.position, searchMarkerB.position);
        getDirections(searchMarker.position, searchMarkerB.position, directionsCallback);

      }
    });
  });

}

function directionsCallback(data) {
   // console.log("HERE");
  //Data contains directions from server
  //Display directions
  data = data.data;
  console.log("Directions from server: ", data);



  hideAllRoutes();
  var locStopA = data.points.stop_pairs[0].stop;
  var locStopB = data.points.stop_pairs[1].stop;
  // If a stop was directly selected....
  console.log("SHORTCUTS: ", shortcutA, shortcutB);
  if(shortcutA != 0) {
      locStopA = stopTable[shortcutA].location.lat+","+stopTable[shortcutA].location.lng;
      searchMarker.setTitle(stopTable[shortcutA].name);
      searchMarker.setPosition(stopTable[shortcutA].location);
      console.log(searchMarker.title);
      var contentString = '<div id="contentB">' +
                  '<div id="siteNoticeB">' +
                  '</div>' +
                  '<h5 id="firstHeading" class="firstHeading">' + stopTable[shortcutA].name + '</h5>' +
                '</div>';
      infowindow.setContent(contentString);
  }
  if(shortcutB != 0) {
      locStopB = stopTable[shortcutB].location.lat+","+stopTable[shortcutB].location.lng
      searchMarkerB.setTitle(stopTable[shortcutB].name);
      searchMarkerB.setPosition(stopTable[shortcutB].location);
      console.log(searchMarkerB.title);
      var contentStringB = '<div id="contentB">' +
                  '<div id="siteNoticeB">' +
                  '</div>' +
                  '<h5 id="firstHeading" class="firstHeading">' + stopTable[shortcutB].name + '</h5>' +
                '</div>';
      infowindowB.setContent(contentStringB);

  }

  //Set map to an overview of the directions
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(searchMarker.position);
  bounds.extend(searchMarkerB.position);
  map.fitBounds(bounds);
  map.setZoom(map.getZoom() - 1);

 //  console.log(locStopA, locStopB);

 $("#results").html("<div><i class='fa fa-close' id='closeResults' style='color:grey;position:absolute;right:.7em;top:.7em;'></i></div>");
 $("#closeResults").click(function() { // Activate the close button
    $("#results").fadeOut(300);
    map.setZoom(15);
    map.setCenter({lat: 43.128397, lng: -77.628681});
    showActiveRoutes();
  });
  for(var x in data.directions){
    var directions = data.directions[x];

    var startAddress = directions.routes[0].legs[0].start_address;
    var endAddress = directions.routes[0].legs[0].end_address;

    if(x == 0){
      console.log("SETTING POLYLINE A", polylineA);
       if(polylineA) { // Clears the last search
          console.log("POLYLINE A EXISTS");
          polylineA.setMap(null);
       }
      try{
        polylineA.setMap(null);
      }catch(err){
        console.log(err);
      }
      $("#results").append("<div class='dir-step'><small>Starting from:</small></br><b>" + searchMarker.title + "</b></div>");

      if(shortcutA == 0) {
      polylineA = new google.maps.Polyline({
                  path: google.maps.geometry.encoding.decodePath(directions.routes[0].overview_polyline.points),
                  strokeColor: "#4286f4",
                  strokeOpacity: 1.0,
                  strokeWeight: 4.0,
                  title: "ROUTE TO STOP",
                  map: map
             });

             //polylineA.setMap(map);

             $("#results").append("<ul>");
             for(var y in directions.routes[0].legs[0].steps){
                var step = directions.routes[0].legs[0].steps[y];
                var dir_html = "<li>" + step.html_instructions + "</li>";

                $("#results").append(dir_html);
             }
             $("#results").append("</ul>");

          }
          // Adds internal directions
          $("#results").append("<div class='dir-step' id='internalResults'></div>");

          if(addInternalDirections(locStopA, locStopB) == -1) { // Error, no way!
             $("#results").html("<h5>Unable to find an active route, try again later or with different locations.</h5>");
             $("#results").fadeIn(300);
             showActiveRoutes();
             return;
          }
    }
    if(x == 1){
       if(polylineB) { // clears last search
          polylineB.setMap(null);
       }
       if(shortcutB == 0) {
      polylineB = new google.maps.Polyline({
                  path: google.maps.geometry.encoding.decodePath(directions.routes[0].overview_polyline.points),
                  strokeColor: "#4286f4",
                  strokeOpacity: 1.0,
                  strokeWeight: 4.0,
                  title: "ROUTE FROM STOP"
             });
             polylineB.setMap(map);

             $("#results").append("<ul>");
             for(var y in directions.routes[0].legs[0].steps){
                var step = directions.routes[0].legs[0].steps[y];
                console.log("STEP:",step);
                var dir_html = "<li>" + step.html_instructions + "</li>";
                console.log(dir_html);
               if($("#results").html().indexOf("arrived at") == -1) {
                      $("#results").append(dir_html);
                }
             }
             $("#results").append("</ul>");
          }
    }
  }
  // Only append if Google didn't already say it.
  if($("#results").html().indexOf("arrived at") == -1) {
    $("#results").append("<div style='margin-top:1em;' class='dir-step'><small>You have arrived at:</small></br><b>" + searchMarkerB.title + "</b></div>");
   }
  $("#results").fadeIn(300);



}

function addInternalDirections(locA, locB) {
   // Find stops with location matching locA and locB
   var stopA = 0; // Will be the ID of stopA
   var stopB = 0; // will be the ID of stopB
   var latA = locA.split(",")[0];
   var lngA = locA.split(",")[1];
   var latB = locB.split(",")[0];
   var lngB = locB.split(",")[1];

   for(var s in stopTable) {
      var stop = stopTable[s];
      if(stop.location.lat == latA && stop.location.lng == lngA) {
         stopA = stop.stop_id;
      }
      if(stop.location.lat == latB && stop.location.lng == lngB) {
         stopB = stop.stop_id;
      }
   }
   // console.log("STOP A AND B: ", stopA, stopB);
   var res = $("#internalResults");
   // Call getPath(stopA, stopB)
   try {
   var path = getPath(stopA, stopB);
   } catch(err) {
      return -1;
   }
   if(path == 0 || path == undefined) { // ERROR
      return -1;
   }
   path = path[0];
   var includedStops = [];
   console.log(stopTable);
   for(var r in path) {
      var route = path[r];
      console.log("ER ROUTE ID = ", route.route_id);
      showRoute(route.route_id);
      $('#route-handler' + route.route_id).prop('checked', true);
      var routeName = routeTable[route.route_id].long_name;
      var enter = stopTable[route.enter].name;
      var exit = stopTable[route.exit].name;
      includedStops.push(enter);
      includedStops.push(exit);
      res.append("<hr>Take the <strong>" + routeName + "</strong>");
      res.append("<br><i style='margin-left:1em;'>From:</i> " + enter + "<br>")
      res.append("<span id='nextTimes_" + route.route_id + "' style='margin-left:1em;'></span>");
      nextTimes(route.enter, route.route_id); // Fills in the time data

      res.append("<i style='margin-left:1em;'>To:</i> " + exit);
   }
   res.append("<hr>");

   // Show the relevant stops
   hideAllStops();
   for(var i in stopMarkerList) {
      var curr = stopMarkerList[i];
      if(includedStops.indexOf(curr.title) != -1) {
        showStop(curr.id);
      }
   }

   // Append results to $("#internalResults")
   // Draw polyline on the map.
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
    $("#search-B-bar").hide();

    // $("#search-A-bar").fadeOut(200);
    // $("#search-bar-button").fadeOut(200);
    setTimeout(function() {
      $("#search-bar-buttonB").fadeIn(500);
      $("#search-B-bar").fadeIn(300);

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

  var internalDirections = {};
  $.get( "/api/closestStop?points=" + points, function( data ) {
    internalDirections = data[0]; // Internal path (ignore the estimate value)
    callback(data);
  });

  // Get request to getClosestStop to get Stop_IDs closest to start and and
  // And ALSO the Google Directions from Start to Stop(Start) and for End too.

  var allDirections = {}; // Will be directly made into HTML
  // Add directions from start to Stop(start) (from getClosestStops endpoint)


  // getDirectionsInternal(Stop(start)), Stop(end))
  // var stopA = "4130838"; // Stop(A)_ID (ID of the closest stop to start)
  // var stopB = "4196010"; // Stop(B)_ID (ID of the closest stop to end)
  // var internalPath = getPath(stopA, stopB)[0];
  // console.log(internalPath);
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
   for(var next in options) { // Each possible next_stop (2nd stop)
      // console.log(G[options[next]]);
      for(var route in Object.keys(G[options[next]])) { // Each possible way to get there (initial route)
         var startingRoute = G[src][options[next]][route];
         cases.push(dijkstraInternal(src, startingRoute));
      }
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
  // Initialization
   for(var v in G) {
      estimates[v] = 9999;
      unvisited.push(v);
   }
   estimates[src] = 0;
   route[src] = initialRoute;
   console.log("INITIAL = ", initialRoute);

   // console.log(initialRoute, G[src]);
   var safety = 0;
   while(unvisited.length > 0) {
      if(safety > 1000) {
         return 0; // Error!
      }
      safety++;
      // Pop v with min estimate[v] from unvisited
      var pop = popMin(estimates, unvisited);
      var v = pop[0];
      unvisited = pop[1];
      for(var u in G[v]) { // For each next_stop
         for(var r in G[v][u]) { // for each route to get to that stop from curr_stop
         // console.log(" IS ACTIVE = ", routeTable[route[v]].is_active);
         if(routeTable[G[v][u][r]] != undefined && routeTable[G[v][u][r]].is_active) {

         // if(routeTable[route[v]].is_active) {
      // console.log(estimates[G[v][u]]);
         // console.log(src, v, G[v][u], route[v]); // next_id, route_id
         // Need to minimize the route transfers (getting off and on a bus)
            if(G[v][u][r] == route[v]) {
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
                  route[u] = G[v][u][r];
               }
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
      if(res[c] == 0) { // Was Error
         continue;
      }
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
   var safety = 0;
   var s = "";
   while(curr != src) {
      safety++;
      if(safety > 1000) {
         return 0;
      }
      s = curr + " - " + stopTable[curr].name + "\n" + s;
      curr = prev[curr]; // Increment
      if(route[curr] != lastRoute) {
         path[0].enter = curr; // Finish entry for the last one
			path.unshift({"route_id": route[curr], "exit": curr}); // Insert next to beginning
         // path[route[curr]] = {"exit": curr};
         lastRoute = route[curr]; // Update last route used
      }
   }
   s = curr + " - " + stopTable[curr].name + "\n" + s;

   console.log("path: ", s);
   path[0].enter = src; // Add entering the first segment
   console.log(src, dst, "SRC : DST");
   console.log("Path = ", path);

   return [path, ests[dst]]; // Returns [path, estimate]
}


// Called right before opening a new infowindow
function hideAllInfoWindows() {
   // Vehicles
   for(var z in vehicleIWList) {
     vehicleIWList[z].close();
  }
  // Stops
   for(var i in stopIWList) {
      stopIWList[i].close();
   }
   // Search Markers
   try {
      infowindow.close();
      infowindowB.close();
   } catch(err){}
}

// Next arival times from stop via specific route (used for directions)
function nextTimes(stop_id, route_id){
   console.log("HERE I AM", stop_id, route_id);
   var html = "<i>ETA: </i> ";
  $.get("/api/estimates?agencies=283&stops="+stop_id, function(data) {
      var estimates = data.estimates;
      console.log("ESTIMATES:", estimates);
      if(estimates.data.length == 0){
      //    $("#nextTimes_" + route_id).html(""); // Error
         return;
      }
      var arrivals = estimates.data[0].arrivals;

      //Creates Raw Estimate Data
      var edata = {};
      for(var x in arrivals){
          var arrival = arrivals[x];
          // Only care about one route
          if(arrival.route_id != route_id) {
             continue;
          }
          if(!edata[arrival.route_id]){
            edata[arrival.route_id] = [];
          }
          edata[arrival.route_id].push(arrival);
      }

      //Convert Raw Estimate Data To HTML
      var curr_time = new Date();
      for(var x in edata){
        var counter = 0;
          for(var y in edata[x]){
             counter++;
             if(counter > 3) { // Shows next 6 for each route
                break;
             }
            console.log(edata[x][y]);
            var time_until = new Date(((new Date(edata[x][y].arrival_at)) - curr_time));
            var min = time_until.getMinutes();
            var hour = time_until.getHours() - 19;

            var parsed_time = "";
            if(hour > 0){
              parsed_time += hour + " hour ";
            }

            parsed_time += min + " min(s)";
            html += parsed_time + ", ";
          }
      }
      if(html.indexOf("min") == -1) {
         $("#nextTimes_" + route_id).hide();
         return; // Error, none found (inactve route)
      }
      $("#nextTimes_" + route_id).show(); // If was hidden before
      html = html.slice(0,-2);
      html += "<br>";
      console.log($("#nextTimes_" + route_id));
      $("#nextTimes_" + route_id).html(html);
      return;
  });
}
