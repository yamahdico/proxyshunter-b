//      <textarea id="Whitelist" rows="5" cols="20" name="Whitelist"></textarea>
//		<div id="selectElementId"></div>

chrome.storage.local.get("active", items=>{
document.querySelector("#Whitelist").value = items.active;
});

function saveOptions() {
	var settingsToStore={
		active: document.querySelector("#Whitelist").value
//		appendFileNames: document.querySelector("#appendFileNames").checked,
		}
	chrome.storage.local.get("active", items=>{
	browser.storage.local.set(settingsToStore);
	});
	Create ();
}
document.querySelector("form").addEventListener("submit", saveOptions);

function Create(){
	var str = document.getElementById("Whitelist").value;
	str = str.trim();
	var arr = str.split("\n");
	var select = document.getElementById('selectElementId');
		for (var i = 0; i <= arr.length-1; i++) {
			var opt = document.createElement("INPUT");
			opt.setAttribute("type", "radio");
			opt.setAttribute("value", arr[i]);
			opt.setAttribute("onclick", "myFunction(this.value)");
			select.append(opt);
			
			var x = document.createElement("LABEL");
			var t = document.createTextNode(arr[i]);
			x.appendChild(t);
			select.append(x);
			
			var newline = document.createElement('br');
			select.append(newline);
		}
}
function myFunction(fff){
	alert(fff);
}