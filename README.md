# http-vue-loader
load .vue files from your html/js

## examples

my-component.vue
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

```html
...
<script type="text/javascript">

	new Vue({
		components: {
			'my-component': httpVueLoader('my-component.vue')
		},
		...
```

or

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


## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Internet_Explorer_10_logo.svg/48px-Internet_Explorer_10_logo.svg.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | ? | ? | Latest ✔ | 10+ ✔ |


## Dependances
* [Vue.js 2](https://vuejs.org/)
* [axios](https://github.com/mzabriskie/axios)
* [es6-promise](https://github.com/stefanpenner/es6-promise) (optional, except for IE)


## API

##### httpVueLoader(`url`)

`url`: any url to a .vue file


##### httpVueLoaderRegister(`vue`, `url`)

`vue`: a Vue instance  
`url`: any url to a .vue file


## How it works

1. http request the vue file
1. load the vue file in a document fragment
1. process each section (template, script and style)
1. return a promise to Vue (async components)


## Notes

The aim of http-vue-loader is to quickly test .vue components without any compilation step, however, for production, use [webpack module bundler](https://webpack.github.io/docs/) with [https://github.com/vuejs/vue-loader](vue-loader)



