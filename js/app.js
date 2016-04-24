/* GLOBALS */

// API keys, kept on a local file not tracked loaded in loadKeys()
// index: 0 = Forecast API key
// index: 1 = Wunderlist Access Token
// index: 2 = WUnderlist Client ID
var apiKeys;
var wunderlistToken;
var wunderlistClientID;


/* ------------- TODOS METHODS ----------- */

function addTasksToPage(tasksR, tasksN) {
  // Add all the tasks to the page
  var todoCircle = '<img id="todo-circle" src="assets/images/circle.png"/>';
  var $todoModule = $('.todos-module');
  var haveAddedTodayTitle = false;
  var haveAddedUpcomingTitle = false;

  // Clear out the div, this is important so that after first fetch,
  // Div is clear and looks the same
  $todoModule.empty();
  $todoModule.append('<h3><img class="main-title-icon" src="assets/images/todo-icon.png"/> REMINDERS</h3>');
  $todoModule.append('<br>');
  // Do the tasks with reminders first, then the tasks with no remidners
  tasksR.forEach(function(task, index) {
    // Set hours to zero, since just care about day
    var dateForReminder = task.reminder.js_date;
    var today = new Date();

    if (dateForReminder.getDay() == today.getDay()) {
      // Due today, append after today section
      if (!haveAddedTodayTitle) {
        $todoModule.append('<p class="todo-date">Today</p>');
        $todoModule.append('<br>');
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
        $todoModule.append('<br>');
        haveAddedUpcomingTitle = true;
      }
      // Not due today
      $todoModule.append(todoCircle);
      $todoModule.append('<p class="todo-item">' + task.title + '</p>');
      var unformatted = new Date(task.reminder.date);
      var formatted = formatFullDate(unformatted, true);
      $todoModule.append('<p class="todo-item-extra">Due on: ' + formatted + '</p>');
    }
  });

  tasksN.forEach(function(task, index) {
    $todoModule.append(todoCircle);
    $todoModule.append('<p class="todo-item-no-date">' + task.title + '</p>');
    $todoModule.append('<br>');
  });

  // After appending content start a time out of 15 minutes, to grab reminders every 15 minutes
  setTimeout(requestWunderlist, 900000);
}

function cleanUpItems(tasks, reminders) {
  // Remove duplicate reminders
  for (i = 0; i < reminders.length; i++) {
    var currentID = reminders[i].id;
    for (j = 0; j < reminders.length; j++) {
      var nextID = reminders[j].id;
      if (i == j) {
        continue;
      } else if (currentID == nextID) {
        reminders.splice(j, 1);
      }
    }
  }
  // Create a new Javascript date and append it to reminder
  for (i = 0; i < reminders.length; i++) {
    var jsDate = new Date(reminders[i].date);
    reminders[i].js_date = jsDate;
  }
  // Now match the tasks with their reminders (if a task has a reminder)
  for (i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    for (j = 0; j < reminders.length; j++) {
      var reminder = reminders[j];
      if (task.id == reminder.task_id) {
        task.reminder = reminder;
      }
    }
  }
  // Create two task arrays, one that has tasks with reminder and one with out
  var tasksWithReminders = [];
  var tasksNoReminders = [];
  for (i = 0; i < tasks.length; i++) {
    if (tasks[i].reminder == null) {
      tasksNoReminders.push(tasks[i]);
    } else {
      tasksWithReminders.push(tasks[i]);
    }
  }
  // Finally sort the array of tasks withs reminder according to their date
  tasksWithReminders.sort(function(a, b) {
    return a.reminder.js_date - b.reminder.js_date;
  });
  // Now that everything is set up, display info on page
  // console.table(tasksWithReminders);
  // console.table(tasksNoReminders);
  addTasksToPage(tasksWithReminders, tasksNoReminders);
}

function onSuccess(lists) {
  var tasks = [];
  var reminders = [];
  var itemsProcessed = 0;
  // Loop through all the lists and grab the tasks & reminders
  for (i = 0; i < lists.length; i++) {
    var list = lists[i];
    var tasksURL = 'https://a.wunderlist.com/api/v1/tasks' + '?list_id=' + list.id;
    var remindersURL = 'https://a.wunderlist.com/api/v1/reminders' + '?list_id=' + list.id;

    // Get all the tasks for a list
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
        if (result.length > 0) {
          result.forEach(function(task) {
            tasks.push(task);
          });
        }
      },
      complete: function() {
        // Done gettting a task, now get the reminders
        $.ajax({
          type: 'GET',
          dataType: 'json',
          url: remindersURL,
          headers: {
            'X-Access-Token': wunderlistToken,
            'X-Client-ID': wunderlistClientID
          },
          contentType: 'application/json; charset=utf-8',
          success: function(result) {
            // Add all reminders to array
            if (result.length > 0) {
              result.forEach(function(reminder) {
                reminders.push(reminder);
              });
            }
          },
          complete: function() {
            itemsProcessed++;
            if (itemsProcessed === lists.length) {
              // Finally done grabbing EVERYTHING
              // Now do do some organization/clean up
              cleanUpItems(tasks, reminders);
              console.log('Completed grabbing tasks/reminders');
            }
          }
        });
      }
    });
  }
}

function onFail(result) {
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
      success: onSuccess,
      error: onFail
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

/* ------------- NEWS MODULE ----------- */
var feeds = [];

function displayFeeds(feeds) {
  // Cool we got the feeds, now display them
  console.log(feeds);
  // Sort feed by date
  // First add a JS date object to feed
  for (i = 0; i < feeds.length; i++) {
    var feed = feeds[i].feed;
    feed.entries.forEach(function(e) {
      var jsDate = new Date(e.publishedDate);
      e.js_date = jsDate;
    });
  }
  // now sort
  feeds.sort(function(a, b) {
    return b.feed.entries[0].js_date - a.feed.entries[0].js_date;
  });
  // Finally display on page
  // First clear any content that was in the div
  var $newsModule = $('.news-module');
  $newsModule.empty();
  $newsModule.append('<h3 id="news-title"><img class="main-title-icon" src="assets/images/news-icon.png"/> NEWS</h3>');
  // Add each feed to page
  for (i = 0; i < feeds.length; i++) {
    var feed = feeds[i].feed;
    // Format the the agency names, some of them are odd
    if (feed.title.includes('NYT')) {
      $newsModule.append('<p class="article-agency">New York Times</p>');
    } else if (feed.title.includes('Open')) {
      $newsModule.append('<p class="article-agency">Ars Technica</p>');
    } else if (feed.title.includes('MacRumors')) {
      $newsModule.append('<p class="article-agency">Mac Rumors</p>');
    } else {
      $newsModule.append('<p class="article-agency">' + feed.title + '</p>');
    }

    // Add the article titles
    // Currently only getting the most recent article
    //TODO: Make some cool algorithm to search for most relevant and liked content
    $newsModule.append('<p class="article-title">' + feed.entries[0].title);
    // Add the publish date
    // Format date first
    var date = new Date(feed.entries[0].publishedDate);
    var formatted = formatFullDate(date, false);
    $newsModule.append('<p class="article-date">' + formatted + '</p>');
  }
}

function feedLoaded(feed) {
  if (!feed.error) {
    // Cool we loaded a feed, add to feed array
    feeds.push(feed);
    // Wait till all feeds are loaded before displaying
    if (feeds.length == 5) {
      displayFeeds(feeds);
    }
  } else {
    // oops???
    console.log('Something went wrong while loading the feed...');
    console.log(feed);
  }
}

// Load google feed api, and set call back to
google.load('feeds', '1');
google.setOnLoadCallback(getRSSFeeds);

function getRSSFeeds() {
  // Create dem feeeeeeeeddds
  var newYorkTimes = new google.feeds.Feed('http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
  var arsTechnica = new google.feeds.Feed('http://feeds.arstechnica.com/arstechnica/open-source');
  var macRumors = new google.feeds.Feed('http://feeds.macrumors.com/MacRumors-Front');
  var yCombinator = new google.feeds.Feed('https://news.ycombinator.com/rss');
  var viceNews = new google.feeds.Feed('https://news.vice.com/rss');
  // Wait for google to do its magic and load the feed
  newYorkTimes.load(feedLoaded);
  arsTechnica.load(feedLoaded);
  macRumors.load(feedLoaded);
  yCombinator.load(feedLoaded);
  viceNews.load(feedLoaded);
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

function formatFullDate(date, withTime) {
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
  var dateString = '';

  if (withTime) {
    dateString = weekday[date.getDay()] + ', ' + month[date.getMonth()] +
    ' ' + date.getDate() + ' at ' + formattedTime;
  } else {
    dateString = weekday[date.getDay()] + ', ' + month[date.getMonth()] +
    ' ' + date.getDate();
  }
  return dateString;
}

// Called once, in order to get data initially, then
// Timers handle the calls
loadKeys();
