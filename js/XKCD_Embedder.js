var XKCD_Embedder = (function(serverURL) {
	var ar = document.querySelectorAll('.xkcd-embed');
	for(var i in ar) { var v = ar[i];
		var id = v.getAttribute('data-id');
		// console.log(ar[i], id);
		$.getJSON(serverURL + '/' + id, function(data) {
			console.log(data);
		});
		// v.innerHTML = "<img src=''></img";
	}
})('http://xkcd-embedder.fahmidur.us');