module = {
	'fish': function() {
		exports.greet = function() {
			return "Hello from fish";
		}
	},
	'./shark': function() {
		exports.greet = function() {
			return "Hello from shark";
		}
	},
	'../whale': function() {
		exports.greet = function() {
			return "Hello from whale";
		}
	},
	'ocean/dolphin': function() {
		exports.greet = function() {
			return "Hello from dolphin";
		}
	}
}
