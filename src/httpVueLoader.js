'use strict';

httpVueLoader.componentNameFromURL = function(url) {

	return url.match(/([^/]+)\.vue|$/)[1];
}

httpVueLoader.scopeStyles = function(styleElt, scopeName) {

	function process() {

		var sheet = styleElt.sheet;
		var rules = sheet.cssRules;

		for ( var i = 0; i < rules.length ; ++i ) {

			var rule = rules[i];
			if ( rule.type !== 1 )
				continue;

			var scopedSelectors = [];

			rule.selectorText.split(/\s*,\s*/).forEach(function(sel) {

				scopedSelectors.push(scopeName+' '+sel);
				var segments = sel.match(/([^ :]+)(.+)?/);
				scopedSelectors.push(segments[1] + scopeName + (segments[2]||''));
			});

			scopedRule = scopedSelectors.join(',') + rule.cssText.substr(rule.selectorText.length);
			sheet.deleteRule(i);
			sheet.insertRule(scopedRule, i);
		}

		styleElt.sheet.disabled = false;
	}

	styleElt.sheet.disabled = true;

	try {
		process();
	} catch (ex) {
		styleElt.addEventListener('load', function onStyleLoaded() {

			styleElt.removeEventListener('load', onStyleLoaded);
			process();
		});
	}
}

httpVueLoader.scopeIndex = 0;

function httpVueLoader(url, name) {

	return function(resolve, reject) {

		axios.get(url)
		.then(function(res) {

			function require(moduleName) {

				return window[moduleName];
			}

			var module = { exports:{} };

			var templateElt = null;
			var scriptElt = null;
			var styleElts = [];

			var doc = document.implementation.createHTMLDocument('');
			doc.body.innerHTML = res.data;

			for ( var it = doc.body.firstChild; it; it = it.nextSibling ) {

				switch ( it.nodeName ) {
					case 'TEMPLATE':
						templateElt = it;
						break;
					case 'SCRIPT':
						scriptElt = it;
						break;
					case 'STYLE':
						styleElts.push(it);
						break;
				}
			}


			if ( scriptElt !== null ) {

				try {
					Function('module', 'require', scriptElt.textContent)(module, require);
				} catch(ex) {

					if ( !('lineNumber' in ex) ) {

						reject(ex);
						return
					}
					var vueFileData = res.data.replace(/\r?\n/g, '\n');
					var lineNumber = vueFileData.substr(0, vueFileData.indexOf(scriptElt.textContent)).split('\n').length + ex.lineNumber - 1;
					throw new (ex.constructor)(ex.message, res.request.responseURL, lineNumber);
				}
			}


			var hasScoped = false;
			for ( var i = 0; i < styleElts.length; ++i ) {

				if ( styleElts[i].hasAttribute('scoped') ) {

					hasScoped = true;
					break;
				}
			}


			var scopeId = '';
			if ( templateElt !== null ) {

				if ( hasScoped ) {

					scopeId = 'data-s-' + (httpVueLoader.scopeIndex++).toString(36);
					(templateElt.content || templateElt).firstElementChild.setAttribute(scopeId, '');
				}
				module.exports.template = templateElt.innerHTML;
			}


			for ( var i = 0; i < styleElts.length; ++i ) {

				var style = document.createElement('style');
				style.textContent = styleElts[i].textContent; // style.styleSheet.cssText = styleElts[i].textContent;
				document.getElementsByTagName('head')[0].appendChild(style);
				if ( hasScoped )
					httpVueLoader.scopeStyles(style, '['+scopeId+']');
			}


			if ( module.exports.name === undefined )
				if ( name !== undefined )
					module.exports.name = name;

			resolve(module.exports);
		}, reject);
	}
}


function httpVueLoaderRegister(Vue, url) {

	Vue.component(httpVueLoader.componentNameFromURL(url), httpVueLoader(url));
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

						var name = httpVueLoader.componentNameFromURL(url);
						components[componentName] = Vue.component(name, httpVueLoader(url, name));
					}
				}
			}
		}
	});
}
