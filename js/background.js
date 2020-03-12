function isEmpty(val) {
	return val === null || val === '' || jQuery.isEmptyObject(val);
}
/***************************Proxy Profile***************************************/
function useProfile(profileKey) {
	// update key_of_profile_in_use
	browser.storage.local.get(profileKey).then((profileObj) => {
		var profile = profileObj[profileKey];

		let proxySettings = {
			autoConfigUrl: "",
			autoLogin: true,
			ftp: "",
			http: "",
			httpProxyAll: false,
			passThrough: "",
			proxyDNS: false,
			proxyType: "",
			socks: "",
			socksVersion: 5,
			ssl: ""
		};
		
		if (profile.type === "direct") {
			proxySettings.proxyType = "none";
		}else if (profile.type === "system"){
			proxySettings.proxyType = "system";
		}else if (profile.type === 'pac') {
			proxySettings.proxyType = "autoConfig";
			proxySettings.autoConfigUrl = profile.host;
		} else {
			proxySettings.proxyType = "manual";
			proxySettings.autoLogin = true;
			proxySettings.passThrough = "localhost, 127.0.0.1/8, 10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12, .local";

			if (profile.type === "http") {
				proxySettings.http = profile.host + ":" + profile.port;
				proxySettings.httpProxyAll = true;
			} else if (profile.type === "ssl") {
				proxySettings.ssl = profile.host + ":" + profile.port;
			} else if (profile.type === "ftp") {
				proxySettings.ftp = profile.host + ":" + profile.port;
			} else if (profile.type === "socks4") {
				proxySettings.socksVersion = 4;
				proxySettings.socks = profile.host+":"+profile.port;
			} else if (profile.type === "socks5") {
				proxySettings.socksVersion = 5;
				proxySettings.socks = profile.host+":"+profile.port;
				proxySettings.proxyDNS = true;
			}
		}
		// update icon
		browser.proxy.settings.set({value: proxySettings}).then(function(){
			updateIcon(profile.type === "direct" || profile.type === "system");
		});
	}).then(function () {
		browser.storage.local.set({ key_of_profile_in_use: profileKey });
	});
}

/*****************************UI Processing**********************************/
// popup on load
$(document).ready(function () {
	browser.storage.local.get().then((profilesObj) => {
		if (isEmpty(profilesObj) || Object.keys(profilesObj).length <= 2) {
			// make default data	
			var defaultProfile = {
					key_of_profile_in_use: 'default',
					default: {
						name: 'direct',
						type: 'direct'
					},
					system: {
						name: 'system',
						type: 'system'
					}
				};

			browser.storage.local.set(defaultProfile).then(function () {
				loadPage();
				useProfile('default');
			});
			return;
		} else {
			loadPage();
			var key_of_profile_in_use = profilesObj['key_of_profile_in_use'];
			useProfile(key_of_profile_in_use);
		}
	});
});

function loadPage() {
	browser.storage.local.get().then((profilesObj) => {
		var key_of_profile_in_use = profilesObj['key_of_profile_in_use'].toString();
		var profileKeys = Object.keys(profilesObj);

		for (var i = 0; i < profileKeys.length; i++) {
			var profileKey = profileKeys[i];
			if (profileKey === 'key_of_profile_in_use') continue;
			var profile = profilesObj[profileKey];

			var element = $('div.hiddenArea > div.proxyProfile').clone();
			element.data('profileKey', profileKey);
			element.children('label').text(profile.name);

			if (profileKey === key_of_profile_in_use) {
				element.children('input[type="radio"]').prop('checked', true);
			}
			if (profile.type === 'direct' || profile.type === 'system') {
				element.children('button.editProxyBtn').remove();
			}
			$('#proxyList').append(element);
		}
	});
}

// Add ProxyDetails
$(document).on('click', '#addProxyBtn', function () {
	var profileKey = 'user-profile-'+$.now();
	var element = $('div.hiddenArea > div.proxyProfileDetails');
	element.find('legend').text('New Proxy Profile');
	element.find('#submitBtn').data('profileKey', profileKey);
	element.find('#deleteProxyBtn').hide();
	$('div.addProxy').append(element);
	$('#addProxyBtn').hide();
	$('button.editProxyBtn').hide(); // hide all Edit button
});

// Edit ProxyDetails
$(document).on('click', 'div.proxyProfile > button.editProxyBtn', function () {
	var currNode = $(this);
	// get profile
	var profileKey = currNode.parent().data('profileKey');

	browser.storage.local.get(profileKey).then((profileObj) => {
		var profile = profileObj[profileKey];
		// fill the form
		var element = $('div.hiddenArea > div.proxyProfileDetails');
		element.find('legend').text('Edit Proxy Profile');
		element.find('#txtProfileName').val(profile.name);
		element.find('#txtProxyScheme').val(profile.type).change();
		element.find('#txtProxyHost').val(profile.host);
		element.find('#txtProxyPort').val(profile.port === 0 ? '' : profile.port);
		element.find('#submitBtn').data('profileKey', profileKey);
		element.find('#deleteProxyBtn').data('profileKey', profileKey);
		element.find('#deleteProxyBtn').show();

		$('#addProxyBtn').hide();
		$('button.editProxyBtn').hide(); // hide all Edit button
		currNode.after(element);
	});
});

// ProxyDetails form submitted
$(document).on('click', '#submitBtn', function () {
	// save data
	var profileKey = $(this).data('profileKey');
	var profileName = $('div.proxyProfileDetails').find('#txtProfileName').val();
	var profileType = $('div.proxyProfileDetails').find('#txtProxyScheme').val();
	var profileHost = $('div.proxyProfileDetails').find('#txtProxyHost').val();
	var profilePort = parseInt($('div.proxyProfileDetails').find('#txtProxyPort').val());
	
	var str = document.getElementById("proxies").value;
		alert(str);




	// check
	if (isEmpty(profileName)) {
		alert('Profile name cannot be emtpy!');
		return;
	} else if (isEmpty(profileHost)) {
		if (profileType === 'pac') {
			alert('PAC URL cannot be empty!');
			return;
		} else {
			alert('Proxy host cannot be empty!');
			return;
		}
	} else if (isNaN(profilePort)) {
		profilePort = 0;
		if (profileType !== 'pac') {
			alert('Proxy port cannot be empty!');
			return;
		}
	}

	var newProxyProfile = {};
	newProxyProfile[profileKey] = {
		name: profileName,
		type: profileType,
		host: profileHost,
		port: profilePort,
	};

	browser.storage.local.set(newProxyProfile).then(function () {
		browser.storage.local.get('key_of_profile_in_use').then((key_of_profile_in_useObj) => {
			var key_of_profile_in_use = Object.values(key_of_profile_in_useObj)[0];
			if (key_of_profile_in_use === profileKey) {
				useProfile(profileKey);
			}
		});
	});

	// move proxyProfileDetails form back to hiddenArea
	$('div.proxyProfileDetails').detach().appendTo('div.hiddenArea');
	// show addProxy and editProxyBtn Button
	$('#addProxyBtn').show();
	$('button.editProxyBtn').show();
});

// deleteProxyBtn click
$(document).on('click', '#deleteProxyBtn', function () {
	var profileKey = $(this).data('profileKey');

	browser.storage.local.get('key_of_profile_in_use').then((key_of_profile_in_useObj) => {
		var key_of_profile_in_use = Object.values(key_of_profile_in_useObj)[0];
		if (key_of_profile_in_use === profileKey) {
			useProfile('default');
		}
		browser.storage.local.remove(profileKey);
		// move proxyProfileDetails form back to hiddenArea
		$('div.proxyProfileDetails').detach().appendTo('div.hiddenArea');
	});
});

// cancelBtn click
$(document).on('click', '#cancelBtn', function () {
	// move proxyProfileDetails form to hiddenArea
	$('div.proxyProfileDetails').detach().appendTo('div.hiddenArea');
});

$(document).on('change', '#txtProxyScheme', function () {
	if (this.value === 'pac') {
		$('#lblProxyHost').text('PAC URL:');
		$('#txtProxyHost').prop('type', 'url');
		$('#lblProxyPort').hide();
		$('#txtProxyPort').hide();
	}
	else {
		$('#lblProxyHost').text('Proxy Host:');
		$('#txtProxyHost').prop('type', 'text');
		$('#lblProxyPort').show();
		$('#txtProxyPort').show();
	}
});

$(document).on('click', 'div.proxyProfile > input.setProxyBtn[type="radio"], div.proxyProfile > label', function () {
	$('input.setProxyBtn[type="radio"]').prop('checked', false);
	$(this).parent().children('input.setProxyBtn[type="radio"]').prop('checked', true);
	var profileKey = $(this).parent().data('profileKey');
	useProfile(profileKey);
});

function updateIcon(isDirect) {
	if (isDirect) {
		// update icon (default)
		browser.browserAction.setIcon({
			path: {
				'19': '../images/icon19.png',
				'38': '../images/icon38.png'
			}
		});
	} else {
		// update icon (running)
		browser.browserAction.setIcon({
			path: {
				'19': '../images/icon19-running.png',
				'38': '../images/icon38-running.png'
			}
		});
	}
}

/********************************Message Handling**************************************/
browser.proxy.onError.addListener(error => {
	console.error(`Proxy error: ${error.message}`);
});

browser.runtime.onUpdateAvailable.addListener(function () {
	browser.runtime.reload();
});

browser.runtime.onStartup.addListener(function (message) {
	// load from storage
	browser.storage.local.get('key_of_profile_in_use').then((key_of_profile_in_useObj) => {
		var key_of_profile_in_use = Object.values(key_of_profile_in_useObj)[0];
		useProfile(key_of_profile_in_use);
	});
});

browser.runtime.onInstalled.addListener(function () {
	// update data from v1.0 to v2.0
	browser.storage.local.get().then((oldData) => {
		if (isEmpty(oldData) === false) {
			var newData = {
				key_of_profile_in_use: 'default',
				default: {
					name: 'direct',
					type: 'direct'
				},
				system:{
					name: 'system',
					type: 'system'
				}
			};

			var hasOldData = false;
			for (var i = 0; i < Object.keys(oldData).length; i++) {
				var key = Object.keys(oldData)[i].toString();
				if (key === 'lastProfileId' && isEmpty(oldData[key]) === false) {
					hasOldData = true;

					newData['key_of_profile_in_use'] = oldData[key].replace('profile-', '');
				} else if (key.startsWith('profile-')) {
					hasOldData = true;

					var profileKey = key.replace('profile-', '');
					var oldProfile = oldData[key].split('|');
					var profileName = oldProfile[0];
					var profileType = oldProfile[1];
					var profileHost = oldProfile[2];
					var profilePort = parseInt(oldProfile[3]);
					if (isNaN(profilePort)) { profilePort = 0; }

					newData[profileKey] = {
						name: profileName,
						type: profileType,
						host: profileHost,
						port: profilePort,
					};
				}
			}
			if (hasOldData) {
				// save new data
				browser.storage.local.clear().then(function () {
					browser.storage.local.set(newData);
				});
			} else {
				browser.storage.sync.get().then((items) => {
					if (isEmpty(items) === false) {
						browser.storage.local.set(items);
					}
				});
			}
		}
	});
});

browser.storage.onChanged.addListener(function (changes, storageArea) {
	/*var storageToBeChanged = storageArea === 'local' ? browser.storage.sync : browser.storage.local;
	for (key in changes) {
		var storageChange = changes[key];		
		if(isEmpty(storageChange.newValue)){
			storageToBeChanged.remove(key);
		}else{
			var obj = {};
			obj[key] = storageChange.newValue;
			storageToBeChanged.set(obj);
		}
    }*/
});


/**************************************************
* Icons made by [Smashicons] from www.flaticon.com 
***************************************************/

















