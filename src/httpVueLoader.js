function componentNameFromURL(url) {
	
	return url.match(/([^/]+)\.vue|$/)[1];
}

function httpVueLoader(url, name) {

	return function(resolve, reject) {
		
		axios.get(url)
		.then(function(res) {
			
			var template = '';

			function require(moduleName) {
				
				return window[moduleName];
			}
			
			var module = { exports:{} };

			var doc = document.implementation.createHTMLDocument('');
			doc.body.innerHTML = res.data;
			var range = doc.createRange();
			range.selectNodeContents(doc.body);
			var fragment = range.extractContents();
			
			
			for ( var it = fragment.firstChild; it; it = it.nextSibling ) {
				
				switch ( it.nodeName ) {
					case 'TEMPLATE':
						template = it.innerHTML;
						break;
					case 'SCRIPT':
						try {
							Function('module', 'require', it.textContent)(module, require);
						} catch(ex) {
							
							if ( !('lineNumber' in ex) ) {
								
								reject(ex);
								return
							}
							var vueFileData = res.data.replace(/\r?\n/g, '\n');
							var lineNumber = vueFileData.substr(0, vueFileData.indexOf(it.textContent)).split('\n').length + ex.lineNumber - 1;
							throw new (ex.constructor)(ex.message, res.request.responseURL, lineNumber);
						}
						break;
					case 'STYLE':
						var style = document.createElement('style');
						style.textContent = it.textContent; // style.styleSheet.cssText = it.textContent;
						document.getElementsByTagName('head')[0].appendChild(style);
						break;
				}
			}
			
			if ( module.exports.name === undefined )
				if ( name !== undefined )
					module.exports.name = name;

			module.exports.template = template;
			resolve(module.exports);
		}, reject);
	}
}

function httpVueLoaderRegister(Vue, url) {

	Vue.component(componentNameFromURL(url), httpVueLoader(url));
}


httpVueLoader.install = function(Vue) {
	
	Vue.mixin({
		
		beforeCreate: function () {
			
			var components = this.$options.components;
			
			for ( var componentName in components ) {
				
				if ( typeof(components[componentName]) === 'string' && components[componentName].substr(0, 4) === 'url:' ) {

					var url = components[componentName].substr(4);
					if ( isNaN(componentName) ) {
						
						components[componentName] = httpVueLoader(url, componentName);	
					} else {
						
						var name = componentNameFromURL(url);
						components[componentName] = Vue.component(name, httpVueLoader(url, name));
					}
				}
			}
		}
	});
}


