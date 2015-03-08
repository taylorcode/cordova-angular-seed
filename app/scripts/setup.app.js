angular.module('myApp').run(function () {
	// convert click events to touch events
	FastClick.attach(document.body);

});

// convert hover states to active states for iOS
$(document).on('touchstart', function () {});