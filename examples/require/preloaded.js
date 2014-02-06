!window.Smoothie && (window.Smoothie = new Object()); 
!window.Smoothie.preloaded && (window.Smoothie.preloaded = new Object()); 
module = typeof module=='undefined' ? Smoothie.preloaded : new Object(); 

module['preloadedA'] = function() {
	'use strict';

	exports.hellostr = 'hello';

	exports.greet = function() {
		return exports.hellostr+' world from '+module.id+'!';
	}
}

module['preloadedB'] = function() {
	'use strict';

	exports.worldstr = 'world';

	exports.greet = function() {
		return 'hello '+exports.worldstr+' from '+module.id+'!';
	}
}
