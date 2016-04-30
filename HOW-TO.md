<h1>Making a Smart Mirror</h1>

<div class="jumps">
<h4>Navigation</h4>
<br>
<p> 
<a href="#materials">Materials Needed</a> 
<br>
<a href="#pi-setup">Setting up the Pi</a> 
<br>
<a href="#the-code">The Code</a> 
<br>
<a href="#building-the-frame">Building the Frame</a> 
<br>
<a href="#wrapping-up">Wrapping Up</a> 
<br>
</p>
</div>
<hr>
<div class="jumps">
</div>
<br>
<h3 id="materials">Materials Needed</h3>
<br>
In this article I'll be going over how to create a "smart mirror." Lets first figure out the materials we need to make this happen.

* $35 - [Raspberry Pi 2](https://www.raspberrypi.org/blog/raspberry-pi-2-on-sale/) (or small computer of choice)
	* You will also need a WiFi module for the Pi
* $100 - Monitor, price varies. I used an oldish monitor I had that was not being used. Here is the model I used: [BenQ GW 2265](http://www.amazon.com/BenQ-GW2265HM-21-5-Inch-LED-Lit-Monitor/dp/B00KYCSRQI/ref=sr_1_10?s=pc&ie=UTF8&qid=1461998526&sr=1-10&keywords=benq) 
* $50 - Two way mirror. _I used a plastic two way mirror, while it was cheap and only around $50, looking back I might have considered spending more money on real glass. Either way, here is the link for the mirror I used [two-way plastic mirror](http://www.tapplastics.com/product/plastics/cut_to_size_plastic/two_way_mirrored_acrylic/558)_
* $20 - Some wood and carpeting supplies

So all in all, around $200 for a very awesome looking mirror. You will also need around 2-3 days worth of time to get everything set up and working correctly.

<h3 id="pi-setup">Setting Up the Pi</h3>
<br>
Now that you have your Pi and presumably all your other materials, lets first get the little computer working correctly. If you bought a kit (like I did), Raspbian comes pre-installed. If not, please look [here](https://www.raspberrypi.org/documentation/installation/installing-images/) to learn how to get the system image onto the SD card and get your Pi booted up. 

Once your Pi is booted up, lets install some packages. First lets make sure Raspbian is up to date, open up a terminal window _(this can be found on the top left menu bar under __accessories__)._ With a terminal window open run these two commands

```
sudo apt-get update
sudo apt-get upgrade
```

Once that is done running, lets get Apache server and Chromium installed. 
__Apache server__ will be used to host our site, and so that we can make cross domain AJAX calls, etc. __Chromium__ will be used because it's better than the default Raspberry Pi browser, as well as the handy kiosk mode that comes with it.

* Install Apache, in terminal run this command

```
sudo apt-get install apache2 apache2-doc apache2-utils
```

* Next, install Chromium run this command

```
sudo apt-get install chromium x11-xserver-utils unclutter
```

Now that we have both Apache and Chromium installed, lets set up the auto-start for Chromium. This means whenever you reboot your Raspberry Pi, the browser will start automatically loaded to the webpage you specify.

__First,__ using Nano, edit the autostart config

```
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

In this file you're going to want to add the following lines

```
@lxpanel –profile LXDE-pi

@pcmanfm –desctop –profile LXDE-pi

#@xscreensaver –no-splash

@xset s off

@xset -dpms

@xset s noblank

@chromium --kiosk --incognito http://localhost/SITE_DIR
```
Where __SITE_DIR__ is the directory that you saved all your site files to. So for example, if your site is saved inside ```/var/www/ ``` and the site directory is named MagicMirror, in this file you would put.

```
@chromium --kiosk --incognito http://localhost/MagicMirror
```

__Next,__ lets tell Raspbian to always boot us into the GUI.

```
sudo raspi-config
```
Navigate __boot_behaviour__ and select that you do want to boot up to the Desktop always.

__Rotatin the Display__ 

Lets now rotate the display, since most of the time you're going to want to have more vertical space than horizontal (it's also how my code is set up to support). Run these commands: 

```
cd /boot
sudo nano config.txt
```
Scroll all the way down, and on a new line add this

```
display_rotate=1
```
This will rotate your display (reboot required), if for whatever reason the display is rotated the wrong way you can do ```display_rotate=3``` 

Test the changes, run 

```
sudo reboot
```

The Raspberry Pi should auto start and open up Chromium. Now we should be ready to add the code to our Raspberry Pi. *(don't worry if you don't see any site yet, you might not have added the site files)*. 


<h3 id="the-code">The Code</h3>
<br>
Awesome, we have the Pi set up (for the most part). Let's now add the code which will power our mirror. You have several options for this

1. Download my code
	* [My very messy yet functional code](https://github.com/luispadron/Magic-Mirror)
2. Download someone else code
	* [Magic Mirror & Magic Mirror 2 Open Source Project](https://github.com/MichMich/MagicMirror)
3. Code it yourself (the best option)
	* Some resources if you want to go this route
		* [TeemTreeHouse](https://teamtreehouse.com) they offer good (paid) guides on how to program in Javascript as well as HTML and CSS
		* [w3schools](http://www.w3schools.com) great site for anything web related
		* Looking at others code and modifying it to your needs


Whichever option you choose, you should have a cool mirror in the end. 
It all just depends how much work you're willing to put into it.
In this section I'll be going over how to get my code to work with your mirror, if you don't to go that route, feel free to [skip](#) this section.

#### Getting my code to work on your mirror
When I first started writing the JS for the site I knew I wanted to share  it with others, so I tried to make it as least reliant on my needs as possible. However, this was written in about a day, so if you're looking for something much more customizable I'd point you over to the [modular](https://github.com/MichMich/MagicMirror) magic mirror project. Written by one of the first guy's I saw make this mirror. 

Ok, now lets get this working for you. You will need two things.

1. Make an account over [here](https://developer.wunderlist.com), this is to sign up to become a developer at Wunderlist. Wunderlist is the application I am using to get notifications, reminders, and tasks from my phone onto my mirror. How it works:
	* Download the Wunderlist app on your phone, [iOS](https://itunes.apple.com/us/app/wunderlist-to-do-list-tasks/id406644151?mt=8) or [Android](https://play.google.com/store/apps/details?id=com.wunderkinder.wunderlistandroid&hl=en)
	* Log into the __same__ account used when you signed up to be a developer
	* Create a task, event, or reminder on your phone
	* The Javascript (mirror) will fetch these items every 15 minutes.
	* Done, you now have reminders on your mirror

	To get this working, first sign up with the link given above. Next, navigate to the [My Apps](https://developer.wunderlist.com/apps) section of the site. Create your application. For the App URL and Auth Callback URL, write _http://localhost_. Next click on the _Create Access Token_ button. You will need to save that token that gets generated as well as your _client id_ for a later step. So save them somewhere, but keep them secret. 	

2. For weather data I am using the [Forecast API](https://developer.forecast.io), head over there and sign up to be a developer.
How it works: 
	* Forcast.io provides you with an API key (keep this to yourself) which allows you to make up 1,000 free calls for weather data a day.
	* There API is using the REST model, all you need to do is send it a query using AJAX and you will get JSON data back about the weather. In my code I then parse this data and display it.
	* The API requires that you know your Latitude and Longitude positions in order to get data back from them of your specific location.
	* To find your location head over to [Google Maps](https://www.maps.google.com)
	* Find your place of residence on the map, and right click, select __what's here?__
	* A pin will drop and you can then copy the latitude and longitude for your location.

	
we still need to get this set up to work with your credentials. Lets first download the code from GitHub, [here](https://github.com/luispadron/Magic-Mirror) either clone/fork it for you're familiar with Github or just download the zip. Download it onto your Raspberry Pi, and __very important__ save it in the ```/var/www/name_of_downloaded_folder``` directory. Make sure to _extract_ it if the file is zipped. 

Cool, we got the boring part set up. Lets now dive into the code and change some things. First thing we need to do is create a text file that will hold all our API keys that way the Javascript can pull it from there and keep it hidden. To do this change directory into the location you saved the folder which should be inside the _/var/www/_ directory

```
cd /var/www/NAME_OF_SAVED_DIR
cd assets/
touch apiKeys.txt  <--- the name of this important
```

Now that we created the apiKeys.txt file, lets add our API keys into it

```
sudo nano apiKeys.txt
```

You will get a Nano screen, which allows you to edit the contents of the file. First, lets add our Forecast API key, followed by the Wunderlist Access token we generated, and lastly the Wunderlist Client ID that was given to us when creating a new app.

```
a45f738558f376111212234d321a716f6,af1cfeac1fc32f580db2ade847b05952230a49c35451b60d22bd2312449d3,47d0c3b32d731258d6c0e
```
It's very important that you keep the formatting the same. No extra spaces on top or bottom, only a comma to separate each key (no space either). This will get parsed into an array of API keys in the JS.

Great, we added our API keys and everything should work correctly now. However you might want to change a few more things to fit your needs.
First, if you're already in the GUI for the Raspberry Pi, then just navigate to the /var/www/NAME_OF_DIR/ folder and edit these files using the Raspberry Pi's text editor, makes it easier than using Nano for everything. 

Lets first edit the name of you location, this is found in the root directory of the folder, inside the __index.html__ file.

```
Look for the <!-- Date & Time info --> comment
Inside the <p> tag, where it says Orlando, Florida
Change this to whatever you like and save the file.
```

Next, lets change the location inside the JS which is making the calls to forecast. 
Inside the ```requestForecastData(url)``` function you should see to variables, latitude and longitude. Change this to whatever your lat and long are. 

```
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
```

You can also change the news feeds, inside the ```getRSSFeeds()``` function. You can change or add feeds however you wish. Just make sure to then call the ```.load()``` method on them.

```
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
```

Finally if you would like things to update faster, currently times are 5 minutes for weather, 5 minutes for Wunderlist, and 2 minutes for the news.

To do this look for any ```setTimeout(nameof_func, 30000)``` method and change the last parameter to the time you would prefer. Remember this time is in _milliseconds_. 

With all of this done, do ```sudo nano sudo nano /etc/xdg/lxsession/LXDE-pi/autostart```

And change ```@chromium --kiosk --incognito http://localhost/SITE_DIR```
To the correct site directory, where you saved all the code for the site.

Test everything out ```sudo reboot```

When the Pi boots back up Chromium should start and the site should be loaded correctly. If something isn't work don't hesitate to [contact me](https://www.lpadron.me/contacts/new) for help. 

### Building the Frame
Now that we have all the code working, lets get to building the frame. This part was honestly the hardest for me, because I am terrible with anything that isn't talking to a computer. However, my awesome dad was able to help me and made me a great frame.

This section will cover some tips and stuff I learned while building the frame, this will be different for everyone since it all depends on the materials you picked out, size of mirror, and monitor etc. 

You're going to first need to remove the monitor from its casing, they're all different. For my monitor I just took a flat head screw driver into the grooves and pried the clips open. Next there were some screws that were removed to separate the monitor from the metal casing that holds all the electronics. Be __careful__ when removing the plastic case from the monitor as there might be wires attached, just take your time and look online for your model and see if anyone has a teardown guide. You will need all the electronics to make the monitor/mirror work so also be careful with them.

For the wood frame, just start by measuring everything out and where you would like to put everything. Remember that LCD monitors get quite hot so move any sensitive instruments away from the monitor.

Getting the outer frame (puppy for scale):

![outer-frame](https://imgur.com/6giW6yi)

Holding the frame pieces in place:

![holding-frame](https://imgur.com/GyebSVC)

Staining the wood, and adding a border to the frame:

![wood-stain](https://imgur.com/tnJ4MQ2)

Something I was worried about while working on this was whether or not the electronics would fail because of being in harsh conditions (the humid hell that is my bathroom, and Florida in general). What I decided to do was spray ALL the electronics (the Pi, monitor board, monitor buttons, etc) with a [conforming spray](http://www.amazon.com/CRC-Urethane-Viscous-Coating-Temperature/dp/B000IC7ZQ2/ref=pd_bia_nav_t_1?ie=UTF8&refRID=017K20WABAD213JQB8AV). This adds humidity protection to the electronics. __Important__ make sure to cover any connections like the USB, HDMI, Power connectors on the Pi before spraying this onto them.

Spraying the Pi (notice the urethane coat):

![spraying the pi](https://imgur.com/FMwcA6I)

After all of this, just make sure put everything together, and hold everything in place. For my set up I bought a bigger mirror than the monitor as well as built the frame a bit better. I also drilled some holes into the monitor metal casing which held the electronics just to add some breathing room so the temps don't get so hot. I pushed the mirror to the top of the frame and supported it with a small wooden piece at the bottom as well as wooden beams across the monitor to stop it from falling backwards. I also added a camera to detect motion and turn monitor off after an hour of inactivity (will write an article on how to implement this seperately)

Packing everything in: 

![packing it up](https://imgur.com/JuRkySP)

<h3 id="wrapping-up">Wrapping Up</h3>
<br>
You now know how to build a pretty cool mirror that gives you useful information at a glance. If you have any questions, comments, etc feel free to [contact me](https://www.lpadron.me/contacts/new).

The finished mirror:

![finished mirror](https://imgur.com/FQbpuJR)


 