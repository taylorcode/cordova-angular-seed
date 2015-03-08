(function (window, undefined) {

    window.cordovaApp = {
        initialize: function() {
            this.bindEvents();
        },
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        onDeviceReady: function() {
            bootStrapApplication();
            overrideBrowser();
            appUpdatePoll();
        },
        currentBuildNumber: null,
        serverConfig: null
    };

    if('cordova' in window) {
        // have to prefix the load path, get the config from the server
        loadJson('server-config.json', function (config) {
            // attach configuration globally for access within application
            window.cordovaApp.serverConfig = window.cordovaAppConfig = config;
            loadAssets(config.address);
        });

    } else {
        loadAssets(); // load without a path prefix
    }

    function bootStrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['cordovaApp']);
        });
    }

    function overrideBrowser() {
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.alert = function (message, title, buttonName, callback) {
                navigator.notification.alert(
                    message,
                    (callback || null),
                    (title || 'Cordova App'),
                    (buttonName || 'OK') 
                );
            };
        }
    }

    function appUpdatePoll() {
        var serverAddress = window.cordovaApp.serverConfig.address;

        // NOTE perhaps if only 'cordova' in window ?
        // have to prefix the load path, get the config from the server
        loadJson(serverAddress + '/config/release-config.json', function (config) {

            loadJson(serverAddress + '/release-info.json', function (info) {

                var currentBuild = window.cordovaApp.currentBuildNumber;

                if (currentBuild !== null && currentBuild !== info.build) { // build number was set, see if it has updated
                    // the build has updated, trigger event
                    window.dispatchEvent(new CustomEvent('cordovaApp:updated', {detail: info}));
                }
                // set the current build number to updates build number
                window.cordovaApp.currentBuildNumber = info.build;
                // re-call with poll interval
                setTimeout(appUpdatePoll, config.updatePollInterval * 1000);

            });

        });
    }

    function loadStyleSheet(src) {
        var head = document.head,
            link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = src;
        head.appendChild(link)
    }

    function loadScriptsSynchronous(urls, i, callback) {
        loadScript(urls[i], function () {
            if(i === urls.length - 1) {
                callback();
            } else {
                loadScriptsSynchronous(urls, i + 1, callback);
            }
        });
    }

    function loadScript(url, callback){
        var script = document.createElement('script')
        script.type = 'text/javascript';
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState === 'loaded' ||
                        script.readyState === 'complete'){
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function(){
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function loadAssets(absPathPrefix) {

        if(!absPathPrefix) {
            absPathPrefix = '';
        }
        // load the application resources
        loadJson(absPathPrefix + '/resources', function(resources) {

            for(var i=0; i < resources.scripts.length; i++) {
                // add domain onto the scripts
                resources.scripts[i] = absPathPrefix + resources.scripts[i];
            }

            // load the stylesheet
            loadStyleSheet(absPathPrefix + '/styles/all.css');

            loadScriptsSynchronous(resources.scripts, 0, function () {
                if(!window.cordova) {
                    bootStrapApplication();
                } else {
                    window.cordovaApp.initialize();
                }
            });
        });
    }

    // generic async loading function
    function loadJson(url, callback) {
        var xhr;
        if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
        else {
            var versions = ['MSXML2.XmlHttp.5.0', 
                            'MSXML2.XmlHttp.4.0',
                            'MSXML2.XmlHttp.3.0', 
                            'MSXML2.XmlHttp.2.0',
                            'Microsoft.XmlHttp']

             for(var i = 0, len = versions.length; i < len; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                }
                catch(e){}
             } // end for
        }
        xhr.onreadystatechange = ensureReadiness;
        function ensureReadiness() {
            // all is well  
            if(xhr.readyState === 4) {
                callback(JSON.parse(xhr.responseText));
            }           
        }
        xhr.open('GET', url, true);
        xhr.send('');
    }

})(window);



