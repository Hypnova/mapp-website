// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

/*global google*/
/*global $*/
/*global navigator*/
/*global place*/

var autocomplete, map, geolocation, place, searchAuto, searchComp;
var options = {
	  types: ['address']  
};

// location added
database.ref().on('child_added', function (data) {
	console.log('child added event');
	data = data.val();
	
  $("#cards").bootstrapTable('prepend', {
		country: data.country,
		state: data.administrative_area_level_1,
		city: data.locality,
		street: data.route,
		number: data.street_number,
		key: data.key
	});
});

database.ref().on('child_removed', function (data) {
	console.log('child remove event');
	$("#cards").bootstrapTable('removeByUniqueId', data.key);
});

//Main map functions
function initMap() {
	$('#cards').bootstrapTable({
    formatNoMatches: function () {
        return 'No locations saved.';
    }
	});
	
	map = new google.maps.Map(document.getElementById('map'), {
  	center: {lat: -33.8688, lng: 151.2195},
  	zoom: 15
  });
  var card = document.getElementById('pac-card');
  var input = document.getElementById('pac-input');

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  autocomplete = new google.maps.places.Autocomplete(input, options);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);
  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
	  map: map,
	  anchorPoint: new google.maps.Point(0, -29)
  });

	autocomplete.addListener('place_changed', function() {
  	infowindow.close();
  	marker.setVisible(false);
  	place = autocomplete.getPlace();
  	if (!place.geometry) {
    	addButton.disabled = true;
  	  // User entered the name of a Place that was not suggested and
  	  // pressed the Enter key, or the Place Details request failed.
  	  window.alert("No details available for input: '" + place.name + "'");
  	  return;
	  }

  	// If the place has a geometry, then present it on a map.
  	addButton.disabled = false; 
  	if (place.geometry.viewport) {
  	  map.fitBounds(place.geometry.viewport);
  	} else {
  	  map.setCenter(place.geometry.location);
  	  map.setZoom(17);  // Why 17? Because it looks good.
  	}
  	marker.setPosition(place.geometry.location);
  	marker.setVisible(true);

  	var address = '';
  	if (place.address_components) {
  	  address = [
  		(place.address_components[0] && place.address_components[0].short_name || ''),
  		(place.address_components[1] && place.address_components[1].short_name || ''),
  		(place.address_components[2] && place.address_components[2].short_name || '')
  	  ].join(' ');
  	}

  	infowindowContent.children['place-icon'].src = place.icon;
  	infowindowContent.children['place-name'].textContent = place.name;
  	infowindowContent.children['place-address'].textContent = address;
  	infowindow.open(map, marker);
  });
  if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		var pos = {
		  lat: position.coords.latitude,
		  lng: position.coords.longitude
		};
		var circle = new google.maps.Circle({
		  center: geolocation,
		  radius: position.coords.accuracy
		});
		autocomplete.setBounds(circle.getBounds());
		map.setCenter(pos);
	}, function() {
		handleLocationError(true, infowindow, map.getCenter());
	});
	} else {
	  // Browser doesn't support Geolocation
	  handleLocationError(false, infowindow, map.getCenter());
	}

	$("#addButton").click(function(){
	  if(place.geometry) {
		var components={};
		var db_data = parse(place);
		console.log(db_data);
		var exists = 0;
		database.ref().once('value').then(function(primSnapshot){
		  primSnapshot.forEach(function(snapshot){
				if (snapshot.val().id == db_data.id){
				  exists = 1;
				}
		  });
		  
		  if (exists != 1){
		  	var key = database.ref().push();
		  	db_data['key'] = ("" + key).substring(37);
				key.set(db_data);
				console.log("ad: " + db_data.key);
		  }
		});
	  }
	});
	
	$("#del").click(function() {
		var selected = $('#cards').bootstrapTable('getSelections');
		
		console.log(selected);
		
		selected.forEach (function (selection) {
			database.ref().child(selection.key).remove();
		});
  });
}

//screw u google
function parse(cmp) {
  var filter = ['country', 'administrative_area_level_1', 'locality', 'route', 'street_number'];
  var data = {};
  
  for (var i = 0; i < cmp.address_components.length; ++i) {
  	for (var j = 0; j < cmp.address_components[i].types.length; ++j) {
  	  for (var k = 0; k < filter.length; ++k) {
  		  if(filter[k] === cmp.address_components[i].types[j]) {
  			  data[filter[k]]=cmp.address_components[i].long_name;
  		  }
  	  }
  	}
  }
  
  data['address'] = data['street_number'] + ' ' + data['route'];
  data['lat'] = cmp.geometry.location.lat();
  data['long'] = cmp.geometry.location.lng();
  data['id'] = cmp.place_id;

  return data;
}
/*
  Initializes search bar for existing locations.
*/
function initSearch(){
	searchComp = $("#searchbox");
	searchAuto = new google.maps.places.Autocomplete(searchComp,opt);
}

/*
  If location not found or not supported express the error in the info window on the map.
*/
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
						  'Error: The Geolocation service failed.' :
						  'Error: Your browser doesn\'t support geolocation.');
	infoWindow.open(map);
}