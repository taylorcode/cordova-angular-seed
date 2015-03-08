angular.module('myApp')

.service('cordovaAppConfig', function ($window) {

	return $window.cordovaAppConfig;

});
