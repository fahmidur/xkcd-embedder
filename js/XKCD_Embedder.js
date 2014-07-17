var XKCD = function(element, serverURL) {
	this.element = element;
	this.data = element.dataset;
	this.url = serverURL + '/' + this.data.id;

	var self = this;

	//LOAD the XKCD
	XKCD_Embedder.getJSON(this.url, function(data) {
		console.log(data, data.img);
		self.element.innerHTML += "<div class='xkcd-embed-title'>"+data.title+"</div>";
		self.element.innerHTML += "<div class='xkcd-embed-comic'><img src='"+data.img+"' title=\""+data.alt+"\"></img></div>";
		// self.element.innerHTML += "<div class='xkcd-embed-alt'>"+data.alt+"</div>";
	}, function() {
		console.log('Failed to load resource: ', this.url);
	});
};

var XKCD_Embedder = function(serverURL) {
	var ar = document.querySelectorAll('.xkcd-embed');
	var xkcds = new Array();

	for(var i = 0; i < ar. length; ++i) { 
		xkcds.push(new XKCD(ar[i], serverURL));
	}
};

//--- static funcs ---
XKCD_Embedder.getJSON = function(url, successCallback, failureCallback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState === 4) {
			if(xmlhttp.status === 200) {
				successCallback(JSON.parse(xmlhttp.responseText));
			} else {
				failureCallback();
			}
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
};

//-----------------------------------------------------------------------
var xkcd = new XKCD_Embedder('http://xkcd-embedder.fahmidur.us');