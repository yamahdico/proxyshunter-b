const DIRECT_PROXY = {
    type: 'direct'
};
let proxies = [DIRECT_PROXY];
var currentProxy = 1;
function handleProxyRequest() {
    return(proxies[currentProxy]);
}
proxies[1] = {"type":"http","host":"198.98.50.164","port":"8080","proxyDNS":false};
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});