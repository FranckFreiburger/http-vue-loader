# http-vue-loader
Load .vue files directly from your html/js. No node.js environment, no build step.

## examples

`my-component.vue`
```html
<template>
	<div class="hello">Hello {{who}}</div>
</template>

<script>
module.exports = {
	data: function() {
		return {
			who: 'world'
		}
	}
}
</script>

<style>
.hello {
	background-color: #ffe;
}
</style>
```

`myFile.html`

using `httpVueLoader()`

```html
...
<script type="text/javascript">

	new Vue({
		components: {
			'my-component': httpVueLoader('my-component.vue')
		},
		...
```

or, using `httpVueLoaderRegister()`

```html
...
<script type="text/javascript">

	httpVueLoaderRegister(Vue, 'my-component.vue');

	new Vue({
		components: [
			'my-component'
		},
		...
```

or, using `httpVueLoader` as a plugin

```html
...
<script type="text/javascript">

	Vue.use(httpVueLoader);

	new Vue({
		components: {
			'my-component': 'url:my-component.vue'
		},
		...
```

or, using an array
```
	new Vue({
		components: [
			'url:my-component.vue'
		},
		...
```

## Features
* `<template>`, `<script>` and `<style>` support the `src` attribute.
* `<style scoped>` is supported.
* `module.exports` may be a promise.
* Support of relative urls in `<template>` and `<style>` sections.
* Support custom scripting langage `<script lang="coffee">` (see VueLoader.langProcessor).
* `http-vue-loader` only supports text/x-template for `<template>` and text/css for `<style>`.


## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Internet_Explorer_10_logo.svg/48px-Internet_Explorer_10_logo.svg.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | ? | ? | Latest ✔ | 9+ ✔ |


## Requirements
* [Vue.js 2](https://vuejs.org/) ([compiler and runtime](https://vuejs.org/v2/guide/installation.html#Explanation-of-Different-Builds))
* [es6-promise](https://github.com/stefanpenner/es6-promise) (optional, except for IE, Chrome < 33, FireFox < 29, [...](http://caniuse.com/#search=promise) )


## API

##### httpVueLoader(`url`)

`url`: any url to a .vue file


##### httpVueLoaderRegister(`vue`, `url`)

`vue`: a Vue instance  
`url`: any url to a .vue file


##### httpVueLoader.httpRequest(`url`)

This is the default httpLoader.  

Use axios instead of the default http loader:
```
httpVueLoader.httpRequest = function(url) {
	
	return axios.get(url)
	.then(function(res) {
		
		return res.data;
	})
	.catch(function(err) {
		
		return Promise.reject(err.status);
	});
}
```

##### httpVueLoader.langProcessor

This is an object that contains langage processors related to the `lang` attribute of the `<script>` section.  
The langage is a simple function that accepts a script source as argument and returns a javascript script source.  

Example:

```
<script src="http://coffeescript.org/v1/browser-compiler/coffee-script.js"></script>
<script src="httpVueLoader.js"></script>

<script>

httpVueLoader.langProcessor.coffee = function(scriptText) {

	return window.CoffeeScript.compile(scriptText, {bare: true});
}

</script>
```

Then, in you `.vue` file:

```
...
<script lang="coffee">

module.exports =
  components: {}
  data: ->
    {}
  computed: {}
  methods: {}
  
</script>
...

```


## How it works

1. http request the vue file
1. load the vue file in a document fragment
1. process each section (template, script and style)
1. return a promise to Vue.js (async components)
1. then Vue.js compiles and cache the component


## Notes

The aim of http-vue-loader is to quickly test .vue components without any compilation step.  
However, for production, I recommend to use [webpack module bundler](https://webpack.github.io/docs/) with [vue-loader](https://github.com/vuejs/vue-loader), 
[webpack-simple](https://github.com/vuejs-templates/webpack-simple) is a good minimalist webpack config you should look at.  
BTW, see also [why Vue.js doesn't support templateURL](https://vuejs.org/2015/10/28/why-no-template-url/).  


## Caveat

Due to the lack of suitable API in Google Chrome and Internet Explorer, syntax errors in the `<script>` section are only reported on FireFox.


## Credits

[Franck Freiburger](https://www.franck-freiburger.com)
