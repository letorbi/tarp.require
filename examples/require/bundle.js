module = {
	'moduleB': function() {
		'use strict';

		exports.hellostr = 'hello';

		exports.greet = function() {
			return exports.hellostr+' world from '+module.id+'!';
		}
	},
	'moduleA': function() {
		'use strict';

		exports.worldstr = 'world';

		exports.greet = function() {
			return 'hello '+exports.worldstr+' from '+module.id+'!';
		}
	}
}
