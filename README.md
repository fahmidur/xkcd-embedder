XKCD Embedder
===

A small bit of JS for embedding XKCDs. Embed the latest XKCD, a particular XKCD, or a random XKCD.

For sample usage see [xkcd-embedder.fahmidur.us](http://xkcd-embedder.fahmidur.us)

## Usage

The usage is quite simple.

### Setup

In your header add the stylesheet:

```html
<link rel='stylesheet' href='http://xkcd-embedder.fahmidur.us/css/xkcd-embedder.css'/>
```

At the end of your body place:
```html
<script src='http://xkcd-embedder.fahmidur.us/js/xkcd-embedder.js'></script>
```

### Normal Usage

For the latest XKCD:
```html
<div class='xkcd-embed' data-id='latest'></div>
```

For an XKCD with a particular ID:
```html
<div class='xkcd-embed' data-id='1'></div>
```

For a random XKCD:
```html
<div class='xkcd-embed' data-id='random'></div>
```

#### You can also set the maxWidth if you need it.
```html
<div class='xkcd-embed' data-id='random' data-maxWidth='400px'></div>
```
