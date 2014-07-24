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
	this.favorites = {};
	this.favoriteResults = {};

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

		// console.log(data, data.img, data.num);
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

		if(self.dataset.maxwidth) {
			img.style.maxWidth = self.dataset.maxwidth;
		}

		var bottom = document.createElement('div');
		bottom.className = 'xkcd-embed-bottom';
		self.element.appendChild(bottom);
		self.c.bottom = bottom;

		var btBack = document.createElement('button');
		btBack.className = 'xkcd-embed-bt xkcd-embed-btBack';
		btBack.textContent = '<-';
		btBack.title = 'Go Back';
		bottom.appendChild(btBack);
		self.c.btBack = btBack;


		var btEarliest = document.createElement('button');
		btEarliest.className = 'xkcd-embed-bt xkcd-embed-btEarliest';
		btEarliest.textContent = "|<";
		bottom.appendChild(btEarliest);
		self.c.btEarliest = btEarliest;

		var btPrev = document.createElement('button');
		btPrev.className = 'xkcd-embed-bt xkcd-embed-btPrev';
		btPrev.textContent = "<";
		bottom.appendChild(btPrev);
		self.c.btPrev = btPrev;

		var btRandom = document.createElement('button');
		btRandom.className = 'xkcd-embed-bt xkcd-embed-btRandom';
		btRandom.textContent = "random";
		bottom.appendChild(btRandom);
		self.c.btRandom = btRandom;

		var btNext = document.createElement('button');
		btNext.className = 'xkcd-embed-bt xkcd-embed-btNext';
		btNext.textContent = ">";
		bottom.appendChild(btNext);
		self.c.btNext = btNext;

		var btLatest = document.createElement('button');
		btLatest.className = 'xkcd-embed-bt xkcd-embed-btLatest';
		btLatest.textContent = ">|";
		bottom.appendChild(btLatest);
		self.c.btLatest = btLatest;

		var btForward = document.createElement('button');
		btForward.className = 'xkcd-embed-bt xkcd-embed-btForward';
		btForward.textContent = '->';
		btForward.title = 'Go Forward';
		bottom.appendChild(btForward);
		self.c.btForward = btForward;

		var btFavorite = document.createElement('button');
		btFavorite.className = 'xkcd-embed-bt xkcd-embed-btFavorite';
		btFavorite.innerHTML = '&hearts;';
		btFavorite.title = 'Add to Favorites';
		bottom.appendChild(btFavorite);
		self.c.btFavorite = btFavorite;

		var btListFavorites = document.createElement('button');
		btListFavorites.className = 'xkcd-embed-bt xkcd-embed-btListFavorites';
		btListFavorites.innerHTML = '&#9776;';

		btListFavorites.title = 'List Favorites';
		bottom.appendChild(btListFavorites);
		self.c.btListFavorites = btListFavorites;

		var overlay = document.createElement('div');
		overlay.className = 'xkcd-embed-overlay';
		self.element.appendChild(overlay);
		self.c.overlay = overlay;

		var favoritesWindow = document.createElement('div');
		favoritesWindow.className = 'xkcd-embed-favoritesWindow';
		self.element.appendChild(favoritesWindow);
		self.c.favoritesWindow = favoritesWindow;

		var inputWrapper = document.createElement('div');
		inputWrapper.className = 'xkcd-embed-favoritesWindow-inputWrapper';
		favoritesWindow.appendChild(inputWrapper);
		self.c.inputWrapper = inputWrapper;

		var input = document.createElement('input');
		input.className = 'xkcd-embed-favoritesWindow-input';
		inputWrapper.appendChild(input);
		input.setAttribute('placeholder', 'Enter Comic Number And Go!');
		self.c.input = input;

		var favoritesWrapper = document.createElement('div');
		favoritesWrapper.className = 'xkcd-embed-favoritesWindow-favoritesWrapper';
		favoritesWindow.appendChild(favoritesWrapper);
		self.c.favoritesWrapper = favoritesWrapper;

		input.addEventListener('keyup', function(e) {
			if(e.keyCode === 27) {
				favoritesWindow.style.display = 'none';
			}
			if(e.keyCode === 13) {
				favoritesWindow.style.display = 'none';
				if(this.value.match(/^\d+$/)) {
					self.goTo(this.value);
				}
			} else {
				// assume user wants to search
				self.searchXKCDs(this.value);
				self.populateFavorites();
			}
		});

		window.setTimeout(function() {
				var imgWidth = img.clientWidth;
				self.c.imgWidth = imgWidth;

				var alt = document.createElement("div");
				alt.className = 'xkcd-embed-alt';
				alt.textContent = data.alt;
				alt.style.width = (imgWidth - 10) + 'px';
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
		}, 1000);

		btBack.addEventListener('click', function() {
			if(self.historyStack.length === 0) { return; }
			self.forwardStack.push(self.data.num);
			var lastNum = self.historyStack.pop();

			// self.url = self.serverURL + '/' + lastNum;
			// self.render();
			self.goTo(lastNum, true);
		});

		btForward.addEventListener('click', function() {
			if(self.forwardStack.length === 0) { return; }
			var nextNum = self.forwardStack.pop();
			self.goTo(nextNum);
		});

		btEarliest.addEventListener('click', function(e) {
			self.goTo(1);
		});

		btPrev.addEventListener('click', function(e) {
			if(self.data.num > 1) {
				self.goTo(parseInt(self.data.num) - 1);
			}
		});

		btRandom.addEventListener('click', function(e) {
			self.goTo('random');
		});

		btNext.addEventListener('click', function(e) {
			self.goTo((parseInt(self.data.num) + 1))
		});

		btLatest.addEventListener('click', function(e) {
			self.goTo('latest');
		});

		btFavorite.addEventListener('click', function(e) {
			self.addToFavorites();
			alert('Added comic #' + self.data.num + ' to your favorites.');
		});

		btListFavorites.addEventListener('click', function(e) {
			self.favoriteResults = {};
			self.c.input.value = "";
			self.populateFavorites();
			favoritesWindow.style.display = 'block';
		});

		favoritesWindow.addEventListener('click', function(e) {
			favoritesWindow.style.display = 'none';
		});

	}, function() {
		console.log('Failed to load resource: ', this.url);
		self.element.innerHTML = prevHTML;
	});
};
XKCD.prototype.goTo = function(id, noHistory) {
	var self = this;
	if(!noHistory){
		if(self.data.num && parseInt(self.data.num) === parseInt(id)) {
		}
		else {
			self.historyStack.push(self.data.num);
		}
	}
	self.url = self.serverURL + '/' + id;
	self.render();
};
XKCD.prototype.populateFavorites = function() {
	var self = this;
	var favoritesWindow = self.c.favoritesWindow;
	var favoritesWrapper = self.c.favoritesWrapper;

	favoritesWrapper.innerHTML = '';

	// TODO: fix mobile issue with favoritesWindow
	// favoritesWindow.style.position = 'fixed';
	// favoritesWindow.style.height = '100.00%';
	// favoritesWindow.style.width = '100.00%';
	// setTimeout(function()  {
	// 	// favoritesWindow.style.height = '100%';
	// 	favoritesWindow.style.height = screen.height;
	// 	favoritesWindow.style.width = '100%';
	// }, 50);

	self.getFavorites();
	console.log('favorites = ', self.favorites);

	var inputWrapper = self.c.inputWrapper;
	var input = self.c.input;

	input.focus();	
	setTimeout(function() {
		input.focus()	
	}, 200);
	setTimeout(function() {
		input.focus()	
	}, 250);

	var donotGo = false;

	var favorites = self.favorites;
	var favoriteResultsLength = Object.keys(self.favoriteResults).length;
	if(favoriteResultsLength > 0) {
		favorites = self.favoriteResults;
	}
	for(var i in favorites) {
		var data = favorites[i];

		var favoriteElement = document.createElement('div');
		favoriteElement.className = 'xkcd-embed-favoriteElement';
		favoriteElement.setAttribute('data-id', i);
		favoritesWrapper.appendChild(favoriteElement);

		var btRemove = document.createElement('span');
		btRemove.className = 'xkcd-embed-favoriteElement-bt';
		btRemove.textContent = 'X';
		btRemove.setAttribute('title', 'Remove From Favorites');
		favoriteElement.appendChild(btRemove);


		var title = document.createElement('span');
		title.textContent = data.title;
		favoriteElement.appendChild(title);


		var number = document.createElement('span');
		number.className = 'xkcd-embed-number';
		number.textContent = i;
		favoriteElement.appendChild(number);

		favoriteElement.addEventListener('click', function(e) {
			if(donotGo) {
				donotGo = false;
				return;
			}
			var id = this.dataset.id;
			self.goTo(id);
		});

		btRemove.addEventListener('click', function(e) {
			var id = this.parentNode.dataset.id;
			console.log('removing... ', id);
			delete self.favorites[id];
			console.log(self.favorites);
			self.saveFavorites();
			donotGo = true;
		});
	} // end-for

	inputWrapper.addEventListener('mouseover', function(e) {
		donotGo = true;
	});

	inputWrapper.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		donotGo = true;
	});

	input.addEventListener('click', function(e) {
		donotGo = true;
	});

};
XKCD.prototype.searchXKCDs = function(q) {
	var self = this;
	console.log('searching: ', q);
	var favoriteResults = {};
	var searchRegex = new RegExp(q, 'i');
	var favorite;
	if(q.match(/^\d+$/)) {
		for(var k in self.favorites) {
			for(var k in self.favorites) {
				favorite = self.favorites[k];
				if(k.toString().match(q)) {
					favoriteResults[k] = favorite;
				}
			}
		}
	} 
	else {
		console.log('HERE');
		for(var k in self.favorites) {
			favorite = self.favorites[k];
			if(favorite.title.match(searchRegex)) {
				favoriteResults[k] = favorite;
			}
			// else
			// if(favorite.transcript.match(searchRegex)) {
			// 	favoriteResults[k] = favorite;	
			// }
		}
	}
	
	console.log('RESULTS = ', favoriteResults);
	self.favoriteResults = favoriteResults;
};
XKCD.prototype.addToFavorites = function() {
	var self = this;
	// self.favorites[self.data.num] = {
	// 	img: self.data.img, 
	// 	alt: self.data.alt, 
	// 	width: self.c.imgWidth, 
	// 	title: self.data.title, 
	// 	transcript: self.data.transcript
	// };

	//nevermind, let us just store everything
	self.favorites[self.data.num] = self.data;
	self.saveFavorites();
};
XKCD.prototype.getFavorites = function() {
	var self = this;
	if(typeof(Storage) !== "undefined") {
		self.favorites = JSON.parse(localStorage.getItem('favorites'));
	}
	return self.favorites;
};
XKCD.prototype.saveFavorites = function() {
	var self = this;
	if(typeof(Storage) !== "undefined") {
		localStorage.setItem('favorites', JSON.stringify(self.favorites));
	}
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
