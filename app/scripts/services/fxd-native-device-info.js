angular.module('fixedApp')

.service('fxdNativeDeviceInfo', function ($window, $http, fxdApi) {

	var cordovaDeviceInfo = $window.device || {},
		uniqueWebToken = $window.localStorage.uniqueWebToken;

	// there is no cordova device info, so we're in mobile web
	// generate a random token if it does not already exist
	if(!cordovaDeviceInfo.uuid && !uniqueWebToken) {
		uniqueWebToken = $window.localStorage.uniqueWebToken = 'MW_' + Math.random().toString(36).slice(2)
	}

	function determineType (platform) {
		// there is no cordova, in mobile web
		if(!platform) {
			return '3';
		}

		if(platform === 'iOS') {
			return '1';
		}
		// otherwise must be android (for now)
		return '2'
	}

	return {
		cordova: $window.device,

		getFixedInfo: function () {

			return fxdApi.device.getReleaseInfo().then(function (info) {

				return {
					app_version: info.tag,
					device_model: cordovaDeviceInfo.model || browserInfo.browser.name,
					cordova_version: cordovaDeviceInfo.cordova,
					device_token: cordovaDeviceInfo.uuid || uniqueWebToken,
					device_type: determineType(cordovaDeviceInfo.platform),
					os_version: cordovaDeviceInfo.version || browserInfo.browser.versionString
				};

			});
		}
	}

})
