var forecastURL = '';

// Grabs API Key from file, so it's not on github
function getForecastURL() {
  $.get('assets/apikey.txt', function(data) {
    // Set appropriate latitude and longitude for location here
    var latitude = '28.521824';
    var longitude = '-81.224258';
    forecastURL += 'https://api.forecast.io/forecast/' + data.trim() + '/' + latitude + ',' + longitude;
    console.log(forecastURL);
  });
}

getForecastURL();
