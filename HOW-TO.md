<h1>Making a Smart Mirror</h1>

<div class="jumps">
<h4>Navigation</h4>
<br>
<p> 
<a href="#materials">Materials Needed</a> 
<br>
<a href="#pi-setup">Setting up the Pi</a> 
<br>
<a href="#using-css">Stylizing Our HTML Document With CSS</a> 
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
Where __SITE_DIR__ is the directory that you saved all your site files to. So for example, if you site is saved inside ```/var/www/ ``` and the site directory is named MagicMirror, in this file you would put.

```
@chromium --kiosk --incognito http://localhost/MagicMirror
```

__Next,__ lets tell Raspbian to always boot us into the GUI.

```
sudo raspi-config
```
Navigate __boot_behaviour__ and select that you do want to boot up to the Desktop always.

Test the changes, run 

```
sudo reboot
```

The Raspberry Pi should auto start and open up Chromium. Now we should be ready to add the code to our Raspberry Pi. *(don't worry if you don't see any site yet, you might not have added the site files)*. 
