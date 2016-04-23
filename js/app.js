/* GLOBALS */

// API keys, kept on a local file not tracked loaded in loadKeys()
// index: 0 = Forecast API key
// index: 1 = Wunderlist Access Token
// index: 2 = WUnderlist Client ID
var apiKeys;
var wunderlistToken;
var wunderlistClientID;

// Todo GLOBALS
var tasks = [];
var reminders;


/* ------------- TODOS METHODS ----------- */

function getRemindersFromTasks() {
  
}

/* Cool we got a success from the server
process all the list information and display it */
function onInitialSuccess(result) {
  // We get the list/list ids of the user which we can then
  // use to make more calls and get more data
  // Loop through the array of lists

  result.forEach(function(index) {
    // Get the task ID's for each list
    var tasksURL = 'https://a.wunderlist.com/api/v1/tasks' + '?list_id=' + index.id;

    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: tasksURL,
      headers: {
        'X-Access-Token': wunderlistToken,
        'X-Client-ID': wunderlistClientID
      },
      contentType: 'application/json; charset=utf-8',
      success: function(result) {
        // Got tasks, now get any reminders for said tasks
        if (result.length === 0) {
          console.log(result);
        } else {
          console.log(result);
          result.forEach(function(index){
            // Add each task to array
            tasks.push(index);
          });
          // Now get the reminders for each task...
          getRemindersFromTasks();
        }
      },
      error: function(error) {
        console.log('Failed while getting tasks');
        console.log(error);
      }
    });
  });
}

function onInitialFail(result) {
  /* oops, something broke */
  alert('We broken fam, pls fix');
  console.log(result);
}

function requestWunderlist() {
  var wunderlistURL = 'https://a.wunderlist.com/api/v1/lists';
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: wunderlistURL,
      headers: {
        'X-Access-Token': wunderlistToken,
        'X-Client-ID': wunderlistClientID
      },
      contentType: 'application/json; charset=utf-8',
      success: onInitialSuccess,
      error: onInitialFail
    });
}


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
  // Call self in order to repeat every second
  setTimeout(updateTime, 1000);
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
function requestForecastData(url) {
    // Build URL
    // Set appropriate latitude and longitude for location here
    var latitude = '28.521824';
    var longitude = '-81.224258';
    // Loaded in key
    var key = apiKeys[0];

    var forecastURL = 'https://api.forecast.io/forecast/' + key + '/' +
      latitude + ',' + longitude;

    $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: forecastURL,
      success: updateWeatherInfo,
      complete: setTimeout(requestForecastData, 300000)
    });
}

/* ------------- HELPERS ----------- */

function loadKeys() {
  // Happens once, when web page first loaded
  // After finishing we call the rest of the functions
  $.get('assets/apiKeys.txt', function(keys) {
    apiKeys = keys.trim().split(',');
    // Call the methods from here since we loaded the keys async
    wunderlistToken = apiKeys[1];
    wunderlistClientID = apiKeys[2];
    updateTime();
    requestForecastData();
    requestWunderlist();
  });
}

// Called once, in order to get data initially, then
// Timers handle the calls
loadKeys();
