var XKCD = function(element, serverURL) {
	this.countID = ++XKCD.count;
	this.element = element;
	this.data = null;
	this.dataset = element.dataset;
	this.serverURL = serverURL;
	this.url = serverURL + '/' + this.dataset.id;
	this.c = {};
	this.historyStack = new Array();
	this.forwardStack = new Array();

	this.render();
};
XKCD.prototype.render = function() {
	var self = this;
	var prevHTML = self.element.innerHTML;
	//LOAD the XKCD
	XKCD_Embedder.getJSON(self.url, function(data) {
		if(data.error) {
			self.element.html = prevHTML;
			return;
		}
		//store the data
		self.data = data;

		//clear element
		self.element.innerHTML = '';

		console.log(data, data.img, data.num);
		var top = document.createElement('div');
		top.className = 'xkcd-embed-top';
		self.element.appendChild(top);

		var title = document.createElement("a");
		title.className = 'xkcd-embed-title';
		title.href = "http://xkcd.com/"+data.num;
		title.target = '_blank';
		title.textContent = data.title;
		top.appendChild(title);
		self.c.title = title;

		var number = document.createElement('span');
		number.className = 'xkcd-embed-number';
		number.textContent = data.num;
		number.style.opacity = 0.5;
		top.appendChild(number);
		self.c.number = number;

		var imgWrapper = document.createElement('div');
		imgWrapper.className = 'xkcd-embed-comic';
		self.element.appendChild(imgWrapper);
		self.c.imgWrapper = imgWrapper;

		var img = document.createElement('img');
		img.src = data.img;
		img.id = 'xkcd-embed-img-'+self.countID;
		img.title = data.alt;
		imgWrapper.appendChild(img);
		self.c.img = img;

		var bottom = document.createElement('div');
		bottom.className = 'xkcd-embed-bottom';
		self.element.appendChild(bottom);
		self.c.bottom = bottom;

		var btBack = document.createElement('button');
		btBack.className = 'xkcd-embed-bt xkcd-embed-btBack';
		btBack.textContent = '<-';
		btBack.title = 'Go Back';
		bottom.appendChild(btBack);


		var btEarliest = document.createElement('button');
		btEarliest.className = 'xkcd-embed-bt xkcd-embed-btEarliest';
		btEarliest.textContent = "|<";
		bottom.appendChild(btEarliest);

		var btPrev = document.createElement('button');
		btPrev.className = 'xkcd-embed-bt xkcd-embed-btPrev';
		btPrev.textContent = "<";
		bottom.appendChild(btPrev);

		var btRandom = document.createElement('button');
		btRandom.className = 'xkcd-embed-bt xkcd-embed-btRandom';
		btRandom.textContent = "random";
		bottom.appendChild(btRandom);

		var btNext = document.createElement('button');
		btNext.className = 'xkcd-embed-bt xkcd-embed-btNext';
		btNext.textContent = ">";
		bottom.appendChild(btNext);

		var btLatest = document.createElement('button');
		btLatest.className = 'xkcd-embed-bt xkcd-embed-btLatest';
		btLatest.textContent = ">|";
		bottom.appendChild(btLatest);

		var btForward = document.createElement('button');
		btForward.className = 'xkcd-embed-bt xkcd-embed-btForward';
		btForward.textContent = '->';
		btForward.title = 'Go Forward';
		bottom.appendChild(btForward);

		btBack.addEventListener('click', function() {
			if(self.historyStack.length === 0) { return; }
			self.forwardStack.push(self.data.num);
			var lastNum = self.historyStack.pop();
			console.log(self.forwardStack);
			self.url = self.serverURL + '/' + lastNum;
			self.render();
		});

		btForward.addEventListener('click', function() {
			if(self.forwardStack.length === 0) { return; }
			self.historyStack.push(self.data.num);
			var nextNum = self.forwardStack.pop();
			self.url = self.serverURL + '/' + nextNum;
			self.render();
		});

		btEarliest.addEventListener('click', function(e) {
			self.historyStack.push(self.data.num);
			self.url = self.serverURL + '/1';
			self.render();
		});

		btPrev.addEventListener('click', function(e) {
			self.historyStack.push(self.data.num);
			if(self.data.num > 1) {
				self.url = self.serverURL + '/' + (parseInt(self.data.num) - 1);
				self.render(); 
			}
		});

		btRandom.addEventListener('click', function(e) {
			self.historyStack.push(self.data.num);
			self.url = self.serverURL + '/random';
			self.render();
		});

		btNext.addEventListener('click', function(e) {
			self.historyStack.push(self.data.num);
			self.url = self.serverURL + '/' + (parseInt(self.data.num) + 1);
			self.render();
		});

		btLatest.addEventListener('click', function(e) {
			self.historyStack.push(self.data.num);
			self.url = self.serverURL + '/latest';
			self.render();
		});

		

		window.setTimeout(function() {
				var imgWidth = img.clientWidth;
				self.c.imgWidth = imgWidth;

				var alt = document.createElement("div");
				alt.className = 'xkcd-embed-alt';
				alt.textContent = data.alt;
				alt.style.width = imgWidth - 10;
				alt.style.display = "none";
				self.c.alt = alt;

				self.element.appendChild(alt);

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
		self.element.innerHTML = prevHTML;
	});
};
XKCD.count = 0;

var XKCD_Embedder = function(serverURL) {
	//insert stylesheet
	
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
