# Cordova Angular Seed Project

#### Clone the git repository

	$ git clone https://github.com/taylorcode/cordova-angular-seed.git
	$ cd cordova-angular-seed

#### Install homebrew

	$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

#### Install foreman

	$ gem install foreman

Or comes packaged with the heroku toolbelt

https://toolbelt.heroku.com

#### Install npm and node

	$ brew install npm -g

#### Install gulp client globally

	$ npm install gulp -g

### Install server/build process packages

	$ cd /path/to/cordova-angular-seed
	$ sudo npm install

### Install client-side packages

	$ cd /path/to/cordova-angular-seed
	$ bower install

## Test project

Execute dev build process

	$ gulp
*this process will end with a task that watches for file changes performs compilation on the fly.

Start server

	$ foreman start

## Build project for deployment

	$ gulp build

### Prepare local files for specific environment (also switch environments locally)

	$ node prepare-app production

or

	$ node prepare-app staging

**to reset the environment for development, re-run foreman start to restart the server**

### Deploy Project to Staging

	$ git push staging phase1:master

### Deploy Project to Production

	$ git push production phase1:master

## Performing a release to Google Play

You will only need to upload a new APK to google play if there are local file changes (anything in `/cordova`), or if any new platforms or plugins are installed. All other updates can be deployed directly through heroku.

#### Increment the application version number
    
    $ cd cordova

Edit the property `versionCode` and optionally `version` on the `<widget>` element in `config.xml`. The version code must be greater than the previous release.

#### Build the release file

    $ cd cordova
    $ cordova build --release android

This will generate an unsigned .apk file called `CordovaApp-release-unsigned.apk` at `/cordova/platforms/android/ant-build`

You can configure the application name in `platforms/android/AndroidManifest.xml`, via the `android:name="CordovaApp"`

#### Sign the unsigned APK with your release key

    $ cd [root of project]
    $ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore cordova/platforms/android/ant-build/CordovaApp-release-unsigned.apk alias_name

It will prompt for a password for the key, enter `MY_KEY_PASSWORD`

#### Optimize your APK for release (required by Google Play)

    $ zipalign -v 4 cordova/platforms/android/ant-build/CordovaApp-release-unsigned.apk CordovaApp.apk
    
You now have a signed and optimized APK file in the projects root called `CordovaApp.apk`.

## Setting Up Cordova

#### Install Cordova

	$ sudo npm install -g cordova

#### Install Android SDK

	$ brew install android-sdk
	$ android

* You'll need the JRE (Java Runtime Enviroment) installed if not already installed 
* You'll also need the "Java JDK" installed

There will be default packages selected, you need to these as well as:

- Android API 19
- Any older android OS versions you want to be able to emulate (e.g. 4.2.2)

Click the "Install n packages..." button, accept the licenses for all of the packages, and click "Install".

#### Set your Android path in bash_profile
	export ANDROID_HOME="/usr/local/Cellar/android-sdk/24.0.2"

#### Install the iOS simulator

	$ npm install -g ios-sim

#### Install Ant (needed for the Android Emulator)

	$ brew install ant

#### Create a new Android Virtual Device

	$ android avd

- Click "Device Definitions" tab
- Select a sample device (e.g. Nexus One)
- Click the "Create AVD" button
- Complete the device profile
	- Select target API level
	- Select CPU (Intel Atom usually has higher performance)
	- Select skin
	- Set front/back webcam to Webcam
	- Define SD card storage (100mb is fine)
	- Select "Use Host GPU" (virtual GPU's are incredibly slow and annoying)
	- Click "Ok"

#### Install HAXM (for Intel emulation)
You'll need "cask" if you don't have it

	$ brew install caskroom/cask/brew-cask && brew update
	$ brew cask install intel-haxm


## Installing Local Cordova Dependencies

#### Add application platforms

	$ cd cordova
	$ cordova platform add ios
	$ cordova platform add android

#### Install application plugins

	$ cordova plugin add ...
	$ cordova prepare

## Running the Emulator

	$ cd /path/to/cordova-angular-seed/cordova
	$ android avd

- Click on device
- Click "Start"
- In the device, connect to the same Wifi the node server is running on

After the emulator boots up:

	$ cordova run android --emulator

or

	$ cordova emulate android

For iOS

	$ cordova run ios --emulator

or

	$ cordova emulate ios

## Building to a Device
1. Turn on developer options (usually found in Settings. You have to click on the version, build or serial number 7 times to active Developer mode)
2. In the new Developer Options menu click "Enable USB Debugging"
3. Plug in the phone
4. `$ cordova run android`
5. It will ask you to approve your computers RSA key. If you don't get this question, it will not work.
