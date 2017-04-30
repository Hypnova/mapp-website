/*global firebase*/

// init database
firebase.initializeApp({
    apiKey: "AIzaSyDSljkdLV1WAOy53AewQZJsOpAkU1qOr10",
    authDomain: "loc-app.firebaseapp.com",
    databaseURL: "https://loc-app-ce8bc.firebaseio.com",
    storageBucket: "loc-app-ce8bc.appspot.com"
});

var database = firebase.database(); // database reference

// END INIT CODE

function addLocation(){

}

function removeLocation(){
    
}

/*
location data structure:
{
    country: ____,
    admin1: _____, // state/province
    city: ______
}
*/

