/* GLOBALS */

// API keys, kept on a local file not tracked loaded in loadKeys()
// index: 0 = Forecast API key
// index: 1 = Wunderlist Access Token
// index: 2 = WUnderlist Client ID
var apiKeys;
var wunderlistToken;
var wunderlistClientID;

// These are some global vars that are used within the updateGreeting() method
var isFirstTimeUpdating = true;
var isRemindersDone = false;
var isWeatherDone = false;
var remindersForToday = 0;
var upcomingRemindersNow = 0;
var remindersWithNoDatesNow = 0;
var weatherObjNow;


/* ------------- GREETING METHODS ----------- */

function displayGreeting(weatherObj, reminders, upcomingR, noDateR) {
  // Do some logic
  var rightNow = new Date();
  var timeGreeting;
  rightNow = formatTime(rightNow, true).split(':');

  var timeInt = parseInt(rightNow[0]);
  // Figure out the greeting time
  if (rightNow[1].indexOf('PM') > -1) {
    // Its the afternoon

    if (timeInt == 12 || timeInt <= 6) {
      timeGreeting = 'Good afternoon, ';
    } else if (timeInt > 6 ) {
      timeGreeting = 'Good evening, ';
    }
  } else {
    // It's some time past 11PM
    if (timeInt == 12 || timeInt >= 1 && timeInt <= 4) {
      // Going to say good evening still, since its not really the morning
      timeGreeting = 'Good evening, ';
    } else if (timeInt > 4 && timeInt <= 11) {
      timeGreeting = 'Good morning, ';
    }
  }

  // Now add the weather summary to greeting
  var weatherSummary = '';
  if (timeGreeting === 'Good morning, ') {
    // Only care about day summary during the morning
    weatherSummary = weatherObj.daily.data[0].summary.toLowerCase();
  } else {
    // If not the morning give hourly summary
    weatherSummary = weatherObj.hourly.data[0].summary.toLowerCase() + ' currently.';
  }

  var finalGreeting = timeGreeting + weatherSummary;

  // Figure out reminder greeting info
  var reminderSummary = '';

  if (reminders > 0) {
    if (reminders > 1) {
      reminderSummary = 'You have <span class="amnt">' + reminders + '</span> tasks due today';
    } else {
      reminderSummary = 'You have <span class="amnt">' + reminders + '</span> task due today';
    }
  }

  if (upcomingR > 0) {
    if (reminders > 0) {
      if (upcomingR > 1) {
        reminderSummary += ', aswell as <span class="amnt">' + upcomingR + '</span> upcoming tasks.';
      } else {
        reminderSummary += ', aswell as <span class="amnt">' + upcomingR + '</span> upcoming task.';
      }
    } else {
      if (upcomingR > 1) {
        reminderSummary = 'You have <span class="amnt">' + upcomingR + '</span> upcoming tasks';
      } else {
        reminderSummary = 'You have <span class="amnt">' + upcomingR + '</span> upcoming task';
      }
    }
  }

  if (noDateR > 0) {
    if ((reminders > 0 && upcomingR <= 0) || (reminders <= 0 && upcomingR > 0)) {
      if (noDateR > 1) {
        reminderSummary += ', aswell as <span class="amnt">' + noDateR + '</span> general tasks floating around.';
      } else {
        reminderSummary += ', aswell as <span class="amnt">' + noDateR + '</span> general task that you should finish.';
      }
    } else if (reminders > 0 && upcomingR > 0) {
      if (noDateR > 1) {
        reminderSummary += ' Finally, <span class="amnt">' + noDateR + '</span> general tasks that should be completed.';
      } else {
        reminderSummary += ' Finally, <span class="amnt">' + noDateR + '</span> general task that needs completion.';
      }
    } else if (reminders <= 0 && upcomingR <= 0) {
      if (noDateR > 1) {
        reminderSummary = 'You have <span class="amnt">' + noDateR + '</span> general things to do soon';
      } else {
        reminderSummary = 'You have <span class="amnt">' + noDateR + '</span> general thing to do soon';
      }
    }
  }

  if (reminders < 0 && upcomingR < 0 && noDateR < 0) {
     // If there are no reminders at ALL
    // "random" so that its not the same everytime
    var randomNum = Math.floor(Math.random() * 3) + 1; // Random num from 1-5
    switch(randomNum) {
      case 1:
        reminderSummary = 'Nothing due today.';
        break;
      case 2:
        reminderSummary = 'Cool, nothing to-do today!';
        break;
      case 3:
        reminderSummary = 'Nothing important going on for today.';
        break;
    }
  }

  // Finally display this
  $greetingModule = $('.greeting');
  // Empty out the div
  $greetingModule.empty();
  $greetingModule.append('<span>' + finalGreeting + '</span><br>');
  $greetingModule.append('<span class="greeting-extra">' + reminderSummary + '</span>');
}

function updateGreeting() {
  if (isRemindersDone && isWeatherDone) {
    // Set these back to false, so that we then wait until new fetches before Updating
    isRemindersDone = false;
    isWeatherDone = false;
    isFirstTimeUpdating = false;

    // Display on page
    displayGreeting(weatherObjNow, remindersForToday, upcomingRemindersNow, remindersWithNoDatesNow);
  }

  // Set timeout to 30 seconds, and call self, so that its always updated
  // isFirstTimeUpdating will be checked because this way we can make sure that the call back
  // is set to 1 second and updated quicker, than if we were to wait 30 seconds on first start
  if (isFirstTimeUpdating) {
    setTimeout(updateGreeting, 1000);
  } else {
    setTimeout(updateGreeting, 30000);
  }
}

/* ------------- TODOS METHODS ----------- */

function addTasksToPage(tasksR, tasksN) {
  // Add all the tasks to the page
  var todoCircle = '<img id="todo-circle" src="assets/images/circle.png"/>';
  var $todoModule = $('.todos-module');
  var haveAddedTodayTitle = false;
  var haveAddedUpcomingTitle = false;

  // Clear out the div, this is important so that after first fetch,
  // Div is clear and looks the same
  // Also, set reminders for today to zero, since this is a new fetch
  remindersForToday = 0;
  upcomingRemindersNow = 0;
  remindersWithNoDatesNow = 0;

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
      // Also increase count of remindersForToday, this is used in the greeting message
      // For example: if there are 3 reminders today it might say
      // Good afternoon, three tasks to-do today.
      remindersForToday++;
      if (!haveAddedTodayTitle) {
        $todoModule.append('<p class="todo-date">Today</p>');
        $todoModule.append('<br>');
        haveAddedTodayTitle = true;
      }
      $todoModule.append(todoCircle);
      $todoModule.append('<p class="todo-item">' + task.title + '</p>');
      var date = new Date(task.reminder.date);
      var formattedDate = formatTime(date, true);
      var string = '<p class="todo-item-exta">Due at <span class="reminder-time">' + formattedDate + '</span></p>';
      $todoModule.append('<p class="todo-item-extra">Due at: <span class="reminder-time">' + formattedDate + '</span></p>');

      // Check to see if reminder is between one hour of being due and now
      // If it is, then change the color
      var now = new Date();
      // Divide by 360000 since time is in mili
      var hoursDifference = Math.abs(now - date) / 3600000;

      // Within one hour
      if (hoursDifference <= 1 && date > now) {
        // Change color to yellow-ish
        $(".reminder-time").addClass('due-soon');
      } else if (date <= now) {
        // Overdue, make color red
        $(".reminder-time").addClass('late');
      }

    } else {
      // Increase count of upcoming reminders global var
      upcomingRemindersNow++;

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
      $todoModule.append('<p class="todo-item-extra">Due on: <span class="reminder-time">' + formatted + '</span></p>');
    }
  });

  tasksN.forEach(function(task, index) {
    // Increase count of reminders with no dates global var, used in updateGreeting
    remindersWithNoDatesNow++;

    $todoModule.append(todoCircle);
    $todoModule.append('<p class="todo-item-no-date">' + task.title + '</p>');
    $todoModule.append('<br>');
  });

  // After appending content start a time out of 5 minutes, to grab reminders every 5 minutes
  // Also set global var isRemindersDone to true
  isRemindersDone = true;
  setTimeout(requestWunderlist, 300000);
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
        break;
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

function displayAllTasksDone() {
  // clear any content that may have been there
  $todoModule = $('.todos-module');
  $todoModule.empty();
  $todoModule.append('<h3><img class="main-title-icon" src="assets/images/todo-icon.png"/> REMINDERS</h3>');
  $todoModule.append('<br>');
  // "random" so that its not the same everytime
  var randomNum = Math.floor(Math.random() * 5) + 1; // Random num from 1-5
  switch(randomNum) {
    case 1:
      $todoModule.append('<p style="opacity: 0.7;">Nothing due, great job!</p>');
      break;
    case 2:
      $todoModule.append('<p style="opacity: 0.7;">Wow all done, great moves keep it up.<br> Proud of you.</p>');
      break;
    case 3:
      $todoModule.append('<p style="opacity: 0.7;">You\'ve either been doing all your work,<br>or just not doing anyhting.<br>Either way, nothing due.</p>');
      break;
    case 4:
      $todoModule.append('<p style="opacity: 0.7;">Get a life, why don\'t we have anything due.</p>');
      break;
    case 5:
      $todoModule.append('<p style="opacity: 0.7;">Cool, we\'re all done for today.</p>');
      break;
  }
  // Set a time out to repeat the request for new reminders every 15 minutes
  // Also set is reminders done to true, and that we have no reminders
  isRemindersDone = true;

}

function getReminders(tasks) {
  var itemsProcessed = 0;
  var reminders = [];

  tasks.forEach(function(task){
    var remindersURL = 'https://a.wunderlist.com/api/v1/reminders' + '?task_id=' + task.id;

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
        if (itemsProcessed == tasks.length) {
          // Finally done grabbing EVERYTHING
          // Now do do some organization/clean up
          cleanUpItems(tasks, reminders);
          console.log('Completed grabbing tasks/reminders');
        }
      }
    });
  });
}

function onSuccess(lists) {
  var tasks = [];
  var reminders = [];
  var itemsProcessed = 0;
  // Loop through all the lists and grab the tasks & reminders
  for (i = 0; i < lists.length; i++) {
    var list = lists[i];
    var tasksURL = 'https://a.wunderlist.com/api/v1/tasks' + '?list_id=' + list.id;

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
        itemsProcessed++;
        if (itemsProcessed == lists.length) {
          // Done getting all tasks now get reminders for tasks
          if (tasks.length === 0) {
            // If we have no tasks then just display empty on page
            displayAllTasksDone();
          } else {
            getReminders(tasks);
          }
        }
      }
    });
  }
}

function onFail(result) {
  /* oops, something broke */
  console.log('Something broke while getting tasks.')
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

  $('.date-time-info p').text(dateString);
  // Update the time in HTML
  $('.date-time-info p').next().text(finalTimeString);
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

  // Set the low and max temp global vars that will be used inside the updateGreeting() method
  weatherObjNow = json;

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
      complete: function() {
        // Repeat every 5 minutes
        // Set isWeatherDone globar var to true
        isWeatherDone = true;
        setTimeout(requestForecastData, 300000);
      }
    });
}

/* ------------- NEWS MODULE ----------- */
var feeds = [];

function animateNewsModule() {
  // Scroll down slowly, then backup...Forever
  $('.news-module').animate({
    scrollTop: $('.news-module').height()
  }, 32000, function() {
    $('.news-module').animate({
      scrollTop: 0
    }, 5000, animateNewsModule);
  });
}

function displayFeeds(feeds) {
  // Cool we got the feeds, now display them
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
  // Add each feed to page
  for (i = 0; i < feeds.length; i++) {
    var feed = feeds[i].feed;
    // Format the the agency names, some of them are odd
    if (feed.title.indexOf('NYT') !== -1) {
      $newsModule.append('<p class="article-agency">New York Times</p>');
    } else if (feed.title.indexOf('Open') !== -1) {
      $newsModule.append('<p class="article-agency">Ars Technica</p>');
    } else if (feed.title.indexOf('MacRumors') !== -1) {
      $newsModule.append('<p class="article-agency">Mac Rumors</p>');
    } else {
      $newsModule.append('<p class="article-agency">' + feed.title + '</p>');
    }

    // Add the article titles
    // Currently only getting the most recent article
    //TODO: Make some cool  algorithm to search for most relevant and liked content

    //Check to see if feed title is empty, for some reason some of them are at times???
    var e = 0;
    while(e < feed.entries.length) {
      if (feed.entries[e].title === '') {
        e++;
      } else {
        break;
      }
    }
    $newsModule.append('<p class="article-title">' + feed.entries[e].title);
    // Add the publish date
    // Format date first
    var date = new Date(feed.entries[e].publishedDate);
    var formatted = formatFullDate(date, false);
    $newsModule.append('<p class="article-date">' + formatted + '</p>');
  }

  // Set timeout to update feed every 2 minutes
  // Also can start animating the module now
  console.log('Done displaying feeds');
  setTimeout(getRSSFeeds, 120000);
  animateNewsModule();
}

function feedLoaded(feed) {
  if (!feed.error) {
    // Cool we loaded a feed, add to feed array
    feeds.push(feed);
    // Wait till all feeds are loaded before displaying
    if (feeds.length == 9) {
      console.log('All feeds loaded, displaying them now.');
      displayFeeds(feeds);
      // Reset feeds array
      feeds = [];
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
  console.log('Getting RSS Feeds');
  // Create dem feeeeeeeeddds
  var newYorkTimes = new google.feeds.Feed('http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
  var arsTech = new google.feeds.Feed('http://feeds.arstechnica.com/arstechnica/index');
  var arsTechnicaOpenSource = new google.feeds.Feed('http://feeds.arstechnica.com/arstechnica/open-source');
  var macRumors = new google.feeds.Feed('http://feeds.macrumors.com/MacRumors-Front');
  var yCombinator = new google.feeds.Feed('https://news.ycombinator.com/rss');
  var viceNews = new google.feeds.Feed('https://news.vice.com/rss');
  var pocketNow = new google.feeds.Feed('http://feeds.feedburner.com/pocketnow');
  var kotaku = new google.feeds.Feed('http://feeds.gawker.com/kotaku/vip');
  var rps = new google.feeds.Feed('http://feeds.feedburner.com/RockPaperShotgun');

  // Wait for google to do its magic and load the feed
  newYorkTimes.load(feedLoaded);
  arsTech.load(feedLoaded);
  arsTechnicaOpenSource.load(feedLoaded);
  macRumors.load(feedLoaded);
  yCombinator.load(feedLoaded);
  viceNews.load(feedLoaded);
  pocketNow.load(feedLoaded);
  kotaku.load(feedLoaded);
  rps.load(feedLoaded);
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
updateGreeting();
