var express = require('express'),
    app = express(),
    glob = require('glob'),
    cons = require('consolidate'),
    _ = require('underscore'),
    mainBowerFiles = require('main-bower-files'),
    fs = require('fs'),
    ip = require('ip');

var ENV_DIRECTORY_HASH = {
        'development': 'app',
        'production': 'dist',
        'staging': 'dist'
    },
    CORDOVA_WEB_PATH = 'cordova/www',
    SERVER_ADDRESSES = require('./server-addresses.json'),
    SERVER_CONFIG_PATH = CORDOVA_WEB_PATH + '/server-config.json',
    INDEX_FILE = 'index.html',
    STATIC_DIR;

// default environment is dev, but it really should be set locally and in a dev environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

app.set('views', __dirname); // this is really only set for index.html
app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('port', (process.env.PORT || 5000));
app.set('environment', process.env.NODE_ENV);
app.set('socketAddress', ip.address() + ':' + app.get('port'));

// define the static directory based on the environment
STATIC_DIR = '/' + ENV_DIRECTORY_HASH[app.get('environment')];
// add the development address
SERVER_ADDRESSES['development'] = 'http://' + app.get('socketAddress');

// little helper function - converts an absolute path to a relative one based on the file serving directory
function absToRel(files) {
    return _.map(files, function(path) {
        return path.substr((STATIC_DIR + __dirname).length);
    });
}

// when the server starts, hardcode some property values in a file
fs.writeFile(__dirname + '/' + SERVER_CONFIG_PATH, JSON.stringify({
    address: SERVER_ADDRESSES[app.get('environment')]
}));

// assume that everything in /js path is pointed to the cordova app website directory
app.get('/js/*', function(req, res) {
    res.sendFile(req.path,  {root: './' + CORDOVA_WEB_PATH});
});

// serve all statics, but don't serve index in /
app.use(express.static(__dirname + STATIC_DIR, {
    index: false
}));

app.get('/resources', function(req, res) {

    var env = app.get('environment');

    if (env === 'development') {
        // get the main bower scripts for this project
        // note, can expand to styles, and other file formats defined in main
        var mainBowerScripts = mainBowerFiles({
            dependencies: null,
            base: __dirname + '/app/bower_components',
            filter: function(filename) {
                return filename.match('.js$');
            }
        });

        // get all javascript files recursively
        glob(__dirname + STATIC_DIR + '/scripts/**/*.js', {}, function(er, files) {
            // convert absolute filepaths to relative ones
            // join the main bower components and the development scripts
            var combinedScripts = absToRel(mainBowerScripts).concat(absToRel(files))
                // render the index file with a scripts property
            res.send({
                scripts: combinedScripts,
                environment: process.env.NODE_ENV
            });
        });

    } else if (env === 'staging' || env === 'production') {
        //just read scripts in dist folder, render out in index
        glob(__dirname + '/dist/scripts/*.js', {}, function(er, files) {
            // reverse files to use natural lexigraphic ordering of vendor, scripts, etc.
            res.send({
                scripts: absToRel(files).reverse(),
                environment: process.env.NODE_ENV
            });
        });
    }

});

// render index when a path is hit that is not a static file
app.get('/*', function(req, res) {
    res.render(CORDOVA_WEB_PATH + '/' + INDEX_FILE);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running at ' + app.get('socketAddress'));
});