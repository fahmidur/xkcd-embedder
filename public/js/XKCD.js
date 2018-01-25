var XKCD = function(element, serverURL) {
  var self = this;

  self.logbase = 'XKCD. ';

	self.countID = ++XKCD.count;
	self.element = element;
	self.data = null;
	self.dataset = element.dataset;
	self.serverURL = serverURL;
	self.url = serverURL + '/' + self.dataset.id;
	self.c = {};
	self.historyStack = new Array();
	self.forwardStack = new Array();
	self.favorites = self.getFavorites();
	self.favoriteResults = {};
	self.user = null;

  self.loginEnabled = true;

	self.render();
};
XKCD.prototype.render = function() {
	var self = this;
  var logbase = self.logbase + 'render. ';

	var prevHTML = self.element.innerHTML;

	XKCD_Embedder.getJSON(self.url, function(resp) {
    console.log(logbase, 'resp = ', resp);
		if(!resp.ok) {
      console.error(logbase, 'NON-OK Response from Server');
			self.element.html = prevHTML;
			return;
		}

    var data = resp.data;

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

		//----------------Start of User Div-----------------------------------------
		var userDivWrapper = document.createElement('div');
		userDivWrapper.className = 'xkcd-embed-userDivWrapper';
		favoritesWindow.appendChild(userDivWrapper);
		self.c.userDivWrapper = userDivWrapper;

		var userDiv = document.createElement('div');
		userDiv.className = 'xkcd-embed-userDiv';
		userDivWrapper.appendChild(userDiv);
		self.c.userDiv = userDiv;

	  if(self.loginEnabled) {	
		//--- Login div
		var loginDiv = document.createElement('form');
		userDiv.appendChild(loginDiv);
		self.c.loginDiv = loginDiv;

		var loginEmail = document.createElement('input');
		loginEmail.className = 'xkcd-embed-userDiv-input';
		loginEmail.setAttribute('placeholder', 'Email');
		loginEmail.setAttribute('type', 'email');
		loginEmail.setAttribute('required', 'true');
		loginDiv.appendChild(loginEmail);
		self.c.loginEmail = loginEmail;

		var loginPassword = document.createElement('input');
		loginPassword.className = 'xkcd-embed-userDiv-input';
		loginPassword.setAttribute('placeholder', 'Password');
		loginPassword.setAttribute('type', 'password');
		loginPassword.setAttribute('required', 'true');
		loginDiv.appendChild(loginPassword);
		self.c.loginPassword = loginPassword;

		var loginSubmit = document.createElement('button');
		loginSubmit.className = 'xkcd-embed-userDiv-btn';
		loginSubmit.textContent = 'Sign In';
		loginDiv.appendChild(loginSubmit);
		self.c.loginSubmit = loginSubmit;

    var loginToReg = document.createElement('a');
    loginToReg.className = 'toggle';
    loginToReg.textContent = 'Register';
    loginDiv.appendChild(loginToReg);
    loginToReg.addEventListener('click', function(e) {
      self.evLoginToReg();
    });
    self.c.loginToReg = loginToReg;

    loginDiv.addEventListener('submit', function(e) { 
      e.preventDefault(); 
      e.stopPropagation(); 
      self.loginAction(); 
    });

		loginSubmit.addEventListener('click', function() { self.loginAction(); } );
		//---------------

    //--- Register div
    var regDiv = document.createElement('form');
    regDiv.style = 'display:none';
    userDiv.appendChild(regDiv);
    self.c.regDiv = regDiv;
    
    var regEmail = document.createElement('input');
		regEmail.className = 'xkcd-embed-userDiv-input';
    regEmail.setAttribute('type', 'email');
    regEmail.setAttribute('placeholder', 'Email');
    regEmail.setAttribute('required', 'true');
    regDiv.appendChild(regEmail);
    self.c.regEmail = regEmail;

    var regPassword = document.createElement('input');
		regPassword.className = 'xkcd-embed-userDiv-input';
    regPassword.setAttribute('type', 'password');
    regPassword.setAttribute('placeholder', 'Password');
    regPassword.setAttribute('required', 'true');
    regDiv.appendChild(regPassword);
    self.c.regPassword = regPassword;

    var regPassword2 = document.createElement('input');
		regPassword2.className = 'xkcd-embed-userDiv-input';
    regPassword2.setAttribute('type', 'password');
    regPassword2.setAttribute('placeholder', 'Password Confirm');
    regPassword2.setAttribute('required', 'true');
    regDiv.appendChild(regPassword2);
    self.c.regPassword2 = regPassword2;

		var regSubmit = document.createElement('button');
		regSubmit.className = 'xkcd-embed-userDiv-btn';
		regSubmit.textContent = 'Register';
		regDiv.appendChild(regSubmit);
		self.c.regSubmit = regSubmit;

		regSubmit.addEventListener('click', function() { self.regAction(); } );

    var regToLogin = document.createElement('a');
    regToLogin.className = 'toggle';
    regToLogin.textContent = 'Login';
    regDiv.appendChild(regToLogin);
    regToLogin.addEventListener('click', function(e) {
      self.evRegToLogin();
    });
    self.c.regToLogin = regToLogin;

		//------------ logout div
		var logoutDiv = document.createElement('div');
		userDiv.appendChild(logoutDiv);
		self.c.logoutDiv = logoutDiv;

		var logoutLink = document.createElement('span');
		logoutLink.className = 'xkcd-embed-link';
		logoutDiv.appendChild(logoutLink);
		self.c.logoutLink = logoutLink;
		logoutLink.addEventListener('click', function() { self.logoutAction(); });
		//----------------------------
    } // End if login Enabled

		//-------End of User Div----------------------------------------------------

		var inputWrapper = document.createElement('div');
		inputWrapper.className = 'xkcd-embed-favoritesWindow-inputWrapper';
		favoritesWindow.appendChild(inputWrapper);
		self.c.inputWrapper = inputWrapper;

		var input = document.createElement('input');
		input.className = 'xkcd-embed-favoritesWindow-input';
		inputWrapper.appendChild(input);
		input.setAttribute('placeholder', 'Enter Comic Number | Search');
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
				self.renderFavorites();
			}
		});

		var imgWidth = img.clientWidth;
		self.c.imgWidth = imgWidth;

		var alt = document.createElement("div");
		alt.className = 'xkcd-embed-alt';
		alt.textContent = data.alt;
		self.c.alt = alt;
		alt.style.display = "none";
		self.element.appendChild(alt);

		imgWrapper.addEventListener("click", function() {
			if(alt.style.display === "none") {
				imgWidth = img.clientWidth; self.c.imgWidth = imgWidth;
				alt.style.width = (imgWidth - 10) + 'px';
				alt.style.display = '';
			} else {
				alt.style.display = "none";
			}
		});

		btBack.addEventListener('click', function() {
			if(self.historyStack.length === 0) { return; }
			self.forwardStack.push(self.data.num);
			var lastNum = self.historyStack.pop();
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
			self.addFavorite();
		});

		btListFavorites.addEventListener('click', function(e) {
			self.favoriteResults = {};
			self.c.input.value = "";
			if(self.user) {
				self.fetchFavorites();
			} else {
        self.renderFavorites();
      }
			favoritesWindow.style.display = 'block';
		});

		favoritesWindow.addEventListener('click', function(e) {
			favoritesWindow.style.display = 'none';
		});

    self.checkLoginState();
	}, function() {
		console.log('Failed to load resource: ', this.url);
		self.element.innerHTML = prevHTML;
	});
};
XKCD.prototype.evRegToLogin = function() {
  var self = this;
  self.c.regDiv.style = 'display:none';
  self.c.loginDiv.style = 'display:block';
};
XKCD.prototype.evLoginToReg = function() {
  var self = this;
  self.c.loginDiv.style = 'display:none';
  self.c.regDiv.style = 'display:block';
};
XKCD.prototype.fetchFavorites = function() {
  var self = this;
  var logbase = self.logbase + 'fetchFavorites. ';

  console.log(logbase, 'FETCHING REMOTE FAVORITES...');

  XKCD_Embedder.getJSON(self.serverURL + '/favorites',
    function success(resp) {
      console.log(logbase, 'resp = ', resp);
      if(!(resp.ok && resp.favorites)) {
        var errorMessage = 'ERROR: ' + logbase + (resp.error || resp.errors.join(', '));
        console.error(errorMessage);
        return;
      }
      self.favorites = resp.favorites;
      self.favoriteResults = {};
      self.renderFavorites();
    },
    function failure() {
      console.log('failed to get favorites');
    }
  );
};
XKCD.prototype.updateUserDiv = function() {
	var self = this;
	if(self.user) {
		self.c.logoutLink.textContent = 'Logout ' + self.user.email;
		self.c.loginDiv.style.display = 'none';
		self.c.logoutDiv.style.display = 'block';
	} else {
		self.c.loginDiv.style.display = 'block';
		self.c.logoutDiv.style.display = 'none';
	}
};
XKCD.prototype.checkLoginState = function() {
	var self = this;
	XKCD_Embedder.getJSON(self.serverURL + '/isLoggedIn', function(data) {
    console.log('checkLoginState. data = ', data);
    if(data.isLoggedIn) {
      console.log('checkLoginState. IS logged in');
      self.user = data.user;
      self.updateUserDiv();
      self.fetchFavorites();
    } else {
      console.log('checkLoginState. NOT logged in');
      self.user = null;
      self.updateUserDiv();
    }
	}, function() {
		console.log('is logged in check failed');
	});
};
XKCD.prototype.logoutAction = function(e) {
	var self = this;
	XKCD_Embedder.getJSON(
    self.serverURL + '/logout', 
    function success(data) {
      console.log('Logout! ', data);
      self.user = null;
      self.favorites = self.getFavorites();
      self.renderFavorites();
      self.updateUserDiv();
    },
    function failure() {
      console.log('failed to logout');
    }
  );
};
XKCD.prototype.regAction = function(e) {
  var self = this;
  console.log('registering... ');
  
  XKCD_Embedder.postJSON(self.serverURL + '/register', {
    email: self.c.regEmail.value, 
    password: self.c.regPassword.value,
    password2: self.c.regPassword2.value,
  }, function success(data) {
    console.log('---- response. data = ', data);
    if(!data.ok) {
      alert("Registration Failed:\n"+data.errors.join("\n"));
      return;
    }
    self.c.loginEmail.value = data.user.email;
    self.evRegToLogin();
    alert("OK. Now try to login");
    self.c.loginPassword.focus();
  }, function failure() {
    console.error('Registration Failed');
  });
};
XKCD.prototype.loginAction = function(e) {
	console.log('logging in...');
	var self = this;
  var logbase = self.logbase + 'loginAction. ';
  console.log(logbase);
	XKCD_Embedder.postJSON(self.serverURL + '/login', {
		email: self.c.loginEmail.value,
		password: self.c.loginPassword.value
	},
	function success(data) {
		console.log('success! data = ', data);
    if(!(data.ok && data.user)) {
			self.c.loginPassword.value = '';
			self.c.loginPassword.focus();
      alert('Access denied');
      return;
    }
    self.user = data.user;
    self.fetchFavorites();
    self.updateUserDiv();
	}, 
	function failure() {
		console.log(logbase, 'failure!');
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
XKCD.prototype.renderFavorites = function() {
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

	console.log('renderFavorites. favorites = ', self.favorites);

	var inputWrapper = self.c.inputWrapper;
	var input = self.c.input;

	input.focus();	
	setTimeout(function() { input.focus(); }, 200);
	setTimeout(function() { input.focus(); }, 250);

	var donotGo = false;

	var favorites = self.favorites || {};
  
  if(Object.keys(favorites).length === 0) {
    var noFaves = document.createElement('h1');
    noFaves.textContent = 'You Have No Favorites';
    favoritesWrapper.append(noFaves);
  }

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
			console.log('btRemove. id =', id);
      preventGo(e);
      self.delFavorite(id);
		});
	} // end-for

	function preventGo(e) {
		e.preventDefault();
		e.stopPropagation();
		donotGo = true;
	};

	inputWrapper.addEventListener('mouseover', preventGo);
	inputWrapper.addEventListener('click', preventGo);
	input.addEventListener('click', preventGo);
	self.c.userDiv.addEventListener('click', preventGo);
};

XKCD.prototype.searchXKCDs = function(q) {
	var self = this;
	console.log('searching: ', q);
	var favoriteResults = {};
	var searchRegex = new RegExp(q, 'i');
	var favorite;
	if(q.match(/^\d+$/)) {
		for(var k in self.favorites) {
			favorite = self.favorites[k];
			if(k.toString().match(q)) {
				favoriteResults[k] = favorite;
			}
		}
	}
	else {
    for(var k in self.favorites) {
      favorite = self.favorites[k];
      if(favorite.title.match(searchRegex)) {
        favoriteResults[k] = favorite;
      }
      //else
      //if(favorite.transcript.match(searchRegex)) {
        //favoriteResults[k] = favorite;	
      //}
      // Above is commented out because it causes UI confusion
      // Searching on what cannot be seen
    }
	}
	
	console.log('RESULTS = ', favoriteResults);
	self.favoriteResults = favoriteResults;
};

XKCD.prototype.delFavorite = function(id) {
  var self = this;

  var logbase = self.logbase + 'delFavorite. ';
  self.favorites = self.favorites || {};

  if(!self.user) {
    console.log(logbase, 'No user. Removing only from localStorage');
    delete self.favorites[id];
    self.saveFavorites();
    self.renderFavorites();
    return;
  }

  console.log(logbase, 'REMOTE. Removing from account. ');

  XKCD_Embedder.getJSON(
    self.serverURL + '/favorites/del/'+id,
    function succ(data) {
      console.log(logbase, 'REMOTE. Delete success. data = ', data);
      delete self.favorites[id];
      self.renderFavorites();
    },
    function err() {
      console.error(logbase, 'REMOTE. Delete failed.');
    }
  );
};

XKCD.prototype.addFavorite = function() {
	var self = this;

  var logbase = self.logbase + 'addFavorite. ';
  self.favorites = self.favorites || {};
  
  if(!self.user) {
    self.favorites[self.data.num] = self.data;
    self.saveFavorites();
    alert('Added comic #' + self.data.num + ' to your Local favorites (in this browser)');
    return;
  }

  XKCD_Embedder.getJSON(
    self.serverURL + '/favorites/add/' + self.data.num, 
    function succ(data) {
      console.error(logbase, 'RESP. added remotely: ', data);
      self.favorites[data.num] = data;
      alert('Added comic #' + self.data.num + ' to your favorites (in your account)');
    }, function fail() {
      console.log(logbase, 'failed to add to favorites remotely');
      alert('ERROR. Failed to add comic #' + self.data.num + ' to your remote favorites.');
    }
  );
};

XKCD.prototype.getFavorites = function() {
	var self = this;
  var logbase = self.logbase + 'getFavorites. ';
	if(typeof(Storage) === "undefined") {
		console.log(logbase, "Unsupported localStorage")
    return {};
	}
  console.log(logbase, 'Fetching favorites from localStore. ');
  var favorites = JSON.parse(localStorage.getItem('favorites')) || {};
  console.log("** getFavorites. Fetched favorites: ", favorites);
	return favorites;
};

XKCD.prototype.saveFavorites = function() {
	var self = this;
  var logbase = self.logbase + 'saveFavorites. ';

	if(typeof(Storage) === "undefined") {
    console.error(logbase, 'Unsupported localStorage');
    return;
  }

  if(self.user) {
    console.log(logbase, 'self.user present. No need to save to localStorage.');
    return;
  }

  console.log(logbase, 'saving favorites to localStore');
  localStorage.setItem('favorites', JSON.stringify(self.favorites));
};
XKCD.count = 0;

var XKCD_Embedder = function(serverURL) {
  var self = this;

	// TODO insert stylesheet
	
	var ar = document.querySelectorAll('.xkcd-embed');
	self.xkcds = new Array();
	for(var i = 0; i < ar. length; ++i) {
		self.xkcds.push(new XKCD(ar[i], serverURL));
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
XKCD_Embedder.postJSON = function(url, data, successCallback, failureCallback) {
	var xmlhttp = new XMLHttpRequest();
	var params = "";
	for(var k in data) {
		console.log(k, ' => ', data[k]);
		params += encodeURIComponent(k) + "=" + encodeURIComponent(data[k]) + "&";
	}
	console.log(params);
	
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState === 4) {
			if(xmlhttp.status === 200) {
				successCallback(JSON.parse(xmlhttp.responseText));
			} else {
				failureCallback();
			}
		}
	};
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xmlhttp.send(params);
};

