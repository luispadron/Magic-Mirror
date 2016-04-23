/* GLOBALS */

// API keys, kept on a local file not tracked loaded in loadKeys()
// index: 0 = Forecast API key
// index: 1 = Wunderlist Access Token
// index: 2 = WUnderlist Client ID
var apiKeys;
var wunderlistToken;
var wunderlistClientID;


/* ------------- TODOS METHODS ----------- */

function addTasksToPage(tasks) {
  // Add all the tasks to the page
  var todoCircle = '<img id="todo-circle" src="assets/images/circle.png"/>';
  var $todoModule = $('.todos-module');
  var haveAddedTodayTitle = false;
  var haveAddedUpcomingTitle = false;

  tasks.forEach(function(task, index) {
    // Set hours to zero, since just care about day
    var dateForReminder = task.reminder.jsDate;
    var today = new Date();

    if (dateForReminder.getDay() == today.getDay()) {
      // Due today, append after today section
      if (!haveAddedTodayTitle) {
        $todoModule.append('<p class="todo-date">Today</p>');
        haveAddedTodayTitle = true;
      }
      $todoModule.append(todoCircle);
      $todoModule.append('<p class="todo-item">' + task.title + '</p>');
      var date = new Date(task.reminder.date);
      var formattedDate = formatTime(date, true);
      $todoModule.append('<p class="todo-item-extra">Due at: ' + formattedDate + '</p>');
    } else {
      if (!haveAddedUpcomingTitle) {
        $todoModule.append('<p class="todo-date">Upcoming</p>');
        haveAddedUpcomingTitle = true;
      }
      // Not due today
      $todoModule.append(todoCircle);
      $todoModule.append('<p class="todo-item">' + task.title + '</p>');
      var unformatted = new Date(task.reminder.date);
      var formatted = formatFullDate(unformatted);
      $todoModule.append('<p class="todo-item-extra">Due on: ' + formatted + '</p>');
    }
  });
}

function organizeTasks(tasks, remindersForTasks) {
  tasks.forEach(function(task) {
    var htmlForReminder = '';
    // Check to see if task has a reminder
    for(i = 0; i < remindersForTasks.length; i++) {
      if (remindersForTasks[i].task_id === task.id) {
        // Create a new JS Date and add to reminder
        var jsDate = new Date(remindersForTasks[i].date);
        remindersForTasks[i].jsDate = jsDate;
        // Append reminder to correct task
        task.reminder = remindersForTasks[i];
      }
    }
    console.log(task);
  });

  // Sort tasks by date
  tasks.sort(function(a, b) {
    return a.reminder.jsDate - b.reminder.jsDate;
  });

  // After appending reminders to the appropriate tasks
  // Figure out if task is due today, or upcoming
  // Then append to the HTML and display
  addTasksToPage(tasks);
}

function getReminders(tasks) {
  console.log('Getting reminders');
  var itemsProcessed = 0;
  var reminders = [];

  tasks.forEach(function(index) {
    // Get the ID's for each list
    var remindersURL = 'https://a.wunderlist.com/api/v1/reminders' + '?task_id=' + index.id;

    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: remindersURL,
      headers: {
        'X-Access-Token': wunderlistToken,
        'X-Client-ID': wunderlistClientID
      },
      contentType: 'application/json; charset=utf-8',
      success: function(reminder) {
        itemsProcessed++;
        // Got the reminders, add to array
        reminder.forEach(function(index) {
          reminders.push(index);
        });
        // Once done iterating, and have gotten all reminders display items
        if (itemsProcessed === tasks.length) {
          // Now that we have both reminders (optional) and tasks, finally
          // Display this to the page
          organizeTasks(tasks, reminders);
        }
      },
      error: function(error) {
        console.log('Failed while getting reminders');
        console.log(error);
      }
    });
  });
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
        var tasks = [];

        if (result.length > 0) {
          result.forEach(function(index){
            // Add each task to array
            tasks.push(index);
          });
          // Now get reminders from each task...
          getReminders(tasks);
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
  var sunriseFormatted = formatTime(sunriseDate, false);
  var sunsetFormatted = formatTime(sunsetDate, false);

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
    // i + 1 because we want the upcoming weather,
    // The json from forecast always returns current weather
    // at the 0th element, we want the next 3 days.
    var max = Math.floor(dailyArray[i + 1].temperatureMax);
    var min = Math.floor(dailyArray[i + 1].temperatureMin);

    var text = '↑' + max + '° ' + ' ↓' + min + '°';
    $(this).text(text);
  });
  console.log($('.daily-forecast p'));
  $('.daily-forecast p').each(function(i) {
    // Same as above start at i + 1, update the heading
    var weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    var date = new Date(dailyArray[i + 1].time * 1000);
    var formattedDate = weekday[date.getDay()];
    if (i === 0) {
      $(this).text('Tomorrow');
    } else {
      $(this).text(formattedDate);
    }
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

function formatTime(date, withTimeOfDay) {
  // Format from 24 hour time
  var formattedDate = (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
  formattedDate = (date.getHours() === 0) ? 12 : formattedDate;
  formattedDate += ':';
  formattedDate += (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

  if (withTimeOfDay) {
    var timeOfDay = (date.getHours() < 12) ? ' AM' : ' PM';
    return formattedDate + timeOfDay;
  } else {
    return formattedDate;
  }
}

function formatFullDate(date) {
  // Formats entire time, used in the todos-module

  // Format the time first
  var formattedTime = formatTime(date, true);

  var weekday = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thur',
    'Fri',
    'Sat'
  ];
  var month = [
    'Jan.',
    'Feb.',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug.',
    'Sept.',
    'Oct.',
    'Nov.',
    'Dec.'
  ];
  var dateString = weekday[date.getDay()] + ', ' + month[date.getMonth()] +
  ' ' + date.getDate() + ' at ' + formattedTime;
  console.log(dateString);
  return dateString;
}

// Called once, in order to get data initially, then
// Timers handle the calls
loadKeys();
