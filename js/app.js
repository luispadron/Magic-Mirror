var forecastAPI = 'https://api.forecast.io/forecast//37.8267,-122.423';

function getApiKeyFromFile() {
  $.get('assets/apikey.txt', function(data) {
      alert(data);
  });
}

getApiKeyFromFile();
