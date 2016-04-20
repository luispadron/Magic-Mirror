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

  $('.date-time-info p').text(dateString);
  // Update the time in HTML
  $('.date-time-info p').next().text(finalTimeString);
  // Recursively call setTimeout in order to repeat every minute
  interval = setTimeout(updateTime, 1000);
}

/* ------------- WEATHER METHODS ----------- */

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
