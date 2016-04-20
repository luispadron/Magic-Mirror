// Globals
var forecastURL = '';

// Updates the weather panel with the retrieved weather information
function updateWeatherInfo(data) {
  console.log('Updating weather info!');
  // Round temp down
  var temp = Math.floor(data.currently.temperature);
  // Set temp
  $('.weather-info span').text(temp + '°');
  // Set the icon depending on what forecast.io tells us
  var weatherIcon = 'assets/' + data.currently.icon + '.png';
  $('#weather-icon').attr('src', weatherIcon);
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

function getForecast() {
  // Grabs API Key from file, so it's not on github
  $.get('assets/apikey.txt', function(data) {
    // Set appropriate latitude and longitude for location here
    var latitude = '28.521824';
    var longitude = '-81.224258';
    forecastURL += 'https://api.forecast.io/forecast/' + data.trim() + '/' + latitude + ',' + longitude;
    console.log(forecastURL);
    requestForecastData();
  });
}

// Runs all the weather related operations
getForecast();
