$(document).ready(function(){

	console.log("Home.js Ready");

	$("#search-box").keydown(function(e){
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
	});

	$("#search-bar-button").click(function(){
		$.get( "/api/places/" + encodeURIComponent($("#search-box").val() + " "), function( data ) {
			console.log("SUCCESS", data);
			var places = data.places;
			if(places.length > 0){
				$("#search-suggestions").hide();

				for(var x in places){
					var place = places[x];
					console.log(place);
					var name = place.name;
					var form_addr = place.formatted_address;
					var location = place.geometry.location;


					var marker = new google.maps.Marker({
						position: location,
						map: map,
						title: name
					});	

					map.setCenter(location);
				}
			}
	
		});
	});

});