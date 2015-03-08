var fs = require('fs'),
	SERVER_ADDRESSES = require('./server-addresses.json'),
	productionKey = 'production';

var commandArgs = process.argv.slice(2),
	environment = commandArgs[0];

if(!environment) {
	console.warn('No environment provided. Defaulting to `production`. Example use: `node prepare-app production`');
	environment = 'production';
}

// write the production url into cordova so that when the wrapper is uploaded, it will be pointing to the production server
fs.writeFile(__dirname + '/cordova/www/server-config.json', JSON.stringify({
    address: SERVER_ADDRESSES[environment]
}));