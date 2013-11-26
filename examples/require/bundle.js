module = {
	'module1': function() {
		'use strict';

		exports.hellostr = 'hello';

		exports.greet = function() {
			return exports.hellostr+' world from '+module.id+'!';
		}
	},
	'module2': function() {
		'use strict';

		exports.worldstr = 'world';

		exports.greet = function() {
			return 'hello '+exports.worldstr+' from '+module.id+'!';
		}
	}
}
