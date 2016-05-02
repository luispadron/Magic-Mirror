import cv2.cv as cv
from datetime import datetime
import time
import sys
from subprocess import call

class MotionDetectorAdaptative():

    def __init__(self, threshold=1):
        self.timeSinceLastMoved = None
        self.timeSinceLastLog = time.time()
        self.writer = None
        self.font = None
        self.frame = None
        self.log = sys.stdout
        self.logFile = open("logFile.log", "w")
        sys.stdout = self.logFile
        # Monitor on/or off
        self.isMonitorOn = True

        self.capture=cv.CaptureFromCAM(0)
        self.frame = cv.QueryFrame(self.capture) #Take a frame to init recorder

        self.gray_frame = cv.CreateImage(cv.GetSize(self.frame), cv.IPL_DEPTH_8U, 1)
        self.average_frame = cv.CreateImage(cv.GetSize(self.frame), cv.IPL_DEPTH_32F, 3)
        self.absdiff_frame = None
        self.previous_frame = None

        self.surface = self.frame.width * self.frame.height
        self.currentsurface = 0
        self.currentcontours = None
        self.threshold = threshold
        self.trigger_time = 0 # Hold timestamp of the last detection

    def wakeMonitorIfOff(self):
        print "movement detected"
        # Reset time since last moved since we just had movement
        self.timeSinceLastMoved = time.time()
        self.timeSinceLastLog = time.time()

        if not self.isMonitorOn:
            print 'Monitor is off, waking it up'
            call(["xset", "s", "reset"])
            call(["xset", "dpms", "force", "on"])
            self.isMonitorOn = True
        else:
            print "Monitor is still on"

    def checkTimeSinceLastMoved(self):
        # Called every time there is no movement
        if self.timeSinceLastMoved == None:
            print "Time since last moved is null, waiting for first move to happen before timer begins."
        else:
            if time.time() - self.timeSinceLastMoved > 590 and self.isMonitorOn:
                print "1 hour passed with no movement, shutting monitor off."
                call(["xset", "dpms", "force", "off"])
                self.isMonitorOn = False
        # Log only every 2 minutes
        if time.time() - self.timeSinceLastLog > 590:
            print "No movement in 10 minutes, still watching."
            self.timeSinceLastLog = time.time()

    def run(self):
        started = time.time()
        while True:

            currentframe = cv.QueryFrame(self.capture)
            instant = time.time() #Get timestamp o the frame

            self.processImage(currentframe) #Process the image


            if self.somethingHasMoved():
                self.trigger_time = instant #Update the trigger_time
                if instant > started +10: #Wait 5 second after the webcam start for luminosity adjusting etc..
                    # Something moved, check to see if monitor is off, if so turn it on
                    self.wakeMonitorIfOff()
                cv.DrawContours (currentframe, self.currentcontours, (0, 0, 255), (0, 255, 0), 1, 2, cv.CV_FILLED)
            else:
                # Check to see if its been specified time, if so turn off Monitor
                self.checkTimeSinceLastMoved()

            c=cv.WaitKey(1) % 0x100
            if c==27 or c == 10: #Break if user enters 'Esc'.
                break

    def processImage(self, curframe):
            cv.Smooth(curframe, curframe) #Remove false positives

            if not self.absdiff_frame: #For the first time put values in difference, temp and moving_average
                self.absdiff_frame = cv.CloneImage(curframe)
                self.previous_frame = cv.CloneImage(curframe)
                cv.Convert(curframe, self.average_frame) #Should convert because after runningavg take 32F pictures
            else:
                cv.RunningAvg(curframe, self.average_frame, 0.05) #Compute the average

            cv.Convert(self.average_frame, self.previous_frame) #Convert back to 8U frame

            cv.AbsDiff(curframe, self.previous_frame, self.absdiff_frame) # moving_average - curframe

            cv.CvtColor(self.absdiff_frame, self.gray_frame, cv.CV_RGB2GRAY) #Convert to gray otherwise can't do threshold
            cv.Threshold(self.gray_frame, self.gray_frame, 50, 255, cv.CV_THRESH_BINARY)

            cv.Dilate(self.gray_frame, self.gray_frame, None, 15) #to get object blobs
            cv.Erode(self.gray_frame, self.gray_frame, None, 10)


    def somethingHasMoved(self):
        # Find contours
        storage = cv.CreateMemStorage(0)
        contours = cv.FindContours(self.gray_frame, storage, cv.CV_RETR_EXTERNAL, cv.CV_CHAIN_APPROX_SIMPLE)

        self.currentcontours = contours #Save contours

        while contours: #For all contours compute the area
            self.currentsurface += cv.ContourArea(contours)
            contours = contours.h_next()

        avg = (self.currentsurface*100)/self.surface #Calculate the average of contour area on the total size
        self.currentsurface = 0 #Put back the current surface to 0

        if avg > self.threshold:
            return True
        else:
            return False


if __name__=="__main__":
    detect = MotionDetectorAdaptative()
    detect.run()
