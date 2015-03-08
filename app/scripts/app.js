angular.module('myApp', [])

.config(function ($compileProvider, $urlMatcherFactoryProvider) {

	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
	
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);

	// allow trailing slash / without trailing slash and will still match
	$urlMatcherFactoryProvider.strictMode(false);

});