function httpVueLoader(url) {

	return function(resolve, reject) {
		
		axios.get(url)
		.then(function(vueFile) {
			
			var template = '';
			var module = { exports:{} };

			var doc = document.implementation.createHTMLDocument('');
			doc.body.innerHTML = vueFile.data;
			var range = doc.createRange();
			range.selectNodeContents(doc.body);
			var fragment = range.extractContents();

			for ( var it = fragment.firstChild; it; it = it.nextSibling ) {
				
				switch ( it.nodeName ) {
					case 'TEMPLATE':
						template = it.innerHTML;
						break;
					case 'SCRIPT':
						Function('module', it.textContent)(module);
						break;
					case 'STYLE':
						var style = document.createElement('style');
						style.textContent = it.textContent; // style.styleSheet.cssText = it.textContent;
						document.getElementsByTagName('head')[0].appendChild(style);
						break;
				}
			}
			
			module.exports.template = template;
			resolve(module.exports);
		}, reject);
	}
}

function httpVueLoaderRegister(Vue, url) {
	
	var name = url.match(/([^/]+)\.vue|$/)[1];
	Vue.component(name, httpLoadVue(name));
}