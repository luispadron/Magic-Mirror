// Globals
var forecastURL;

// Timers, repeat the functions in order to keep data updated
var dateTimeUpdater = setTimeout(updateTime, 1000);
var weatherUpdater = setTimeout(getForecast, 300000);


/* ------------- DATE TIME METHODS ----------- */

// Update time module
// Repeates every second (in order to keep accurate time).
function updateTime() {
  // Get time
  var currentDate = new Date();
  var currentHours = currentDate.getHours();
  var currentMinutes = currentDate.getMinutes();
  var currentSeconds = currentDate.getSeconds();

  // Format the time
  // Add leading zero if required to minutes/seconds
  currentMinutes = (currentMinutes < 10 ? '0' : '') + currentMinutes;
  currentSeconds = (currentSeconds < 10 ? '0' : '') + currentSeconds;
  // Get time of day
  var timeOfDay = (currentHours < 12) ? 'AM' : 'PM';
  // Format from 24 hour time
  currentHours = (currentHours > 12) ? currentHours - 12 : currentHours;
  currentHours = (currentHours === 0) ? 12 : currentHours;
  // Join strings
  var finalTimeString = currentHours + ':' + currentMinutes + ' ' + timeOfDay;

  // Update the date in HTML
  var weekday = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  var month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  var dateString = weekday[currentDate.getDay()] + ', ' + month[currentDate.getMonth()] +
  ' ' + currentDate.getDate();

  $('.date-time-info p').next().text(dateString);
  // Update the time in HTML
  $('.date-time-info p').next().next().text(finalTimeString);
  // Recursively call setTimeout in order to repeat every minute
  interval = setTimeout(updateTime, 1000);
}

/* ------------- WEATHER METHODS ----------- */

// Updates the weather panel with the retrieved weather information
function updateWeatherInfo(json) {
  console.log('Updating weather info!');
  // Round temp down
  var currentTemp = Math.floor(json.currently.temperature);
  // Set current temp
  $('#main-weather-temp').text(currentTemp + '°');
  // Set the icon depending on what forecast.io tells us
  var weatherIcon = 'assets/images/' + json.currently.icon + '.png';
  $('#main-weather-icon').attr('src', weatherIcon);

  // Set sunrise and sundown time
  var dailyArray = json.daily.data;
  // This is in UNIX time, must be converted, also 0 element because
  // Only care about sunrise/sundown time for current day.
  var sunriseTime = dailyArray[0].sunriseTime;
  var sunsetTime = dailyArray[0].sunsetTime;
  var sunriseDate = new Date(sunriseTime * 1000);
  var sunsetDate = new Date(sunsetTime * 1000);
  // Format dates
  var sunriseFormatted = (sunriseDate.getHours() > 12) ? sunriseDate.getHours() - 12 : sunriseDate.getHours();
  sunriseFormatted = (sunriseDate.getHours() === 0) ? 12 : sunriseFormatted;
  sunriseFormatted += ':';
  sunriseFormatted += (sunriseDate.getMinutes() < 10 ? '0' : '') + sunriseDate.getMinutes();

  var sunsetFormatted = (sunsetDate.getHours() > 12) ? sunsetDate.getHours() - 12 : sunsetDate.getHours();
  sunsetFormatted = (sunsetDate.getHours() === 0) ? 12 : sunsetFormatted;
  sunsetFormatted += ':';
  sunsetFormatted += (sunsetDate.getMinutes() < 10 ? '0' : '') + sunsetDate.getMinutes();

  // Set time in HTML
  $('.sun-up-down p span').text(sunriseFormatted);
  $('.sun-up-down p span').next().text(sunsetFormatted);

  // Set upcoming weather
  $('.secondary-weather-icon').each(function(i) {
    // Set each image
    var img = 'assets/images/' + dailyArray[i].icon + '.png';
    $(this).attr('src', img);
  });

  $('.daily-forecast span').each(function(i) {
    var max = Math.floor(dailyArray[i].temperatureMax);
    var min = Math.floor(dailyArray[i].temperatureMin);

    var text = '↑' + max + '° ' + ' ↓' + min + '°';
    $(this).text(text);
  });


}

// Makes a JSONP request to developer.forecast.io,
// Callback on success: updateWeatherInfo(data)
function requestForecastData() {
    $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: forecastURL,
      success: updateWeatherInfo,
      complete: setTimeout(getForecast, 300000)
    });
}

function getForecast() {
  // Grabs API Key from file (if it hasnt been grabbed before), so it's not on github
  if (forecastURL === undefined) {
    $.get('assets/apikey.txt', function(data) {
      console.log('No url, getting API key from file, to append to URL');
      // Set appropriate latitude and longitude for location here
      var latitude = '28.521824';
      var longitude = '-81.224258';

      forecastURL = 'https://api.forecast.io/forecast/' + data.trim() + '/' +
      latitude + ',' + longitude;

      requestForecastData();
    });
  } else {
    console.log('We have URL already, getting weather');
    requestForecastData();
  }
}

// Called once, in order to get data initially, then
// Timers handle the calls
updateTime();
getForecast();
