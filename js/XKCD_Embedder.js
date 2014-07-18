var XKCD = function(element, serverURL) {
	this.countID = ++XKCD.count;
	this.element = element;
	this.data = element.dataset;
	this.url = serverURL + '/' + this.data.id;

	var self = this;

	//LOAD the XKCD
	XKCD_Embedder.getJSON(this.url, function(data) {
		console.log(data, data.img, data.num);
		var top = document.createElement('div');
		top.className = 'xkcd-embed-top';
		element.appendChild(top);

		var title = document.createElement("a");
		title.className = 'xkcd-embed-title';
		title.href = "http://xkcd.com/"+data.num;
		title.target = '_blank';
		title.textContent = data.title;
		top.appendChild(title);

		var number = document.createElement('span');
		number.className = 'xkcd-embed-number';
		number.textContent = data.num;
		number.style.opacity = 0.5;
		top.appendChild(number);

		var imgWrapper = document.createElement('div');
		imgWrapper.className = 'xkcd-embed-comic';
		element.appendChild(imgWrapper);

		var img = document.createElement('img');
		img.src = data.img;
		img.id = 'xkcd-embed-img-'+self.countID;
		imgWrapper.appendChild(img);

		window.setTimeout(function() {
				var imgWidth = img.clientWidth;

				var alt = document.createElement("div");
				alt.className = 'xkcd-embed-alt';
				alt.textContent = data.alt;
				alt.style.width = imgWidth - 10;
				alt.style.display = "none";

				element.appendChild(alt);

				imgWrapper.addEventListener("click", function() {
					if(alt.style.display === "none") {
						alt.style.display = '';
					} else {
						alt.style.display = "none";
					}
				});
		}, 5000);

		
	}, function() {
		console.log('Failed to load resource: ', this.url);
	});
};
XKCD.count = 0;

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
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
};

//-----------------------------------------------------------------------
var xkcd = new XKCD_Embedder('http://xkcd-embedder.fahmidur.us');