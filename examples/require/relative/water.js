!window.Smoothie && (window.Smoothie = new Object()); 
!window.Smoothie.preloaded && (window.Smoothie.preloaded = new Object()); 
module = typeof module=='undefined' ? Smoothie.preloaded : new Object(); 

module['fish'] = function() {
	exports.greet = function() {
		return "Hello from fish";
	}
}

module['./shark'] = function() {
	exports.greet = function() {
		return "Hello from shark";
	}
}

module['../whale'] = function() {
	exports.greet = function() {
		return "Hello from whale";
	}
}

module['ocean/dolphin'] = function() {
	exports.greet = function() {
		return "Hello from dolphin";
	}
}
