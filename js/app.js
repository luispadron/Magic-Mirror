// Globals
var forecastURL = '';

// Updates the weather panel with the retrieved
// Weather information
function updateWeatherInfo(data) {
  console.log('Updating weather info!');
  // Round temp down
  var temp = Math.floor(data.currently.temperature);
  // Set temp
  $('#weather-info span').text(temp + '°');
}

// Makes a JSONP request to developer.forecast.io,
// Callback on success: updateWeatherInfo(data)
function requestForecastData() {
    $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: forecastURL,
      success: function(data) {
        updateWeatherInfo(data);
      }
    });
}

// Grabs API Key from file, so it's not on github
function getForecastURL() {
  $.get('assets/apikey.txt', function(data) {
    // Set appropriate latitude and longitude for location here
    var latitude = '28.521824';
    var longitude = '-81.224258';
    forecastURL += 'https://api.forecast.io/forecast/' + data.trim() + '/' + latitude + ',' + longitude;
    console.log(forecastURL);
    requestForecastData();
  });
}

getForecastURL();
