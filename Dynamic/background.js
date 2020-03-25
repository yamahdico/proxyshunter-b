const DIRECT_PROXY = {
    type: 'direct'
};
let proxies = [DIRECT_PROXY];
var currentProxy = 0;

function buttonClicked() {
    currentProxy = (currentProxy ? 0 : 1);
    browser.storage.local.set({ currentProxy: currentProxy });
    browser.storage.local.set({ proxySettings: {"name":"http","type":"http","host":"198.98.50.164","port":"8080","proxyDNS":false} });
}

function settingsChanged(settings) {
    if ("proxySettings" in settings)
        proxies[1] = settings.proxySettings.newValue;
}

function handleProxyRequest(requestInfo) {
    return(proxies[currentProxy]);
}

browser.storage.local.get({ currentProxy: 0, proxySettings: DIRECT_PROXY }, items=>{
    currentProxy = items.currentProxy;
    proxies[1] = items.proxySettings;
});

browser.storage.onChanged.addListener(settingsChanged);
browser.browserAction.onClicked.addListener(buttonClicked);
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});
