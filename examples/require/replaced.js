'use strict';

// this.greet = function() {
// 	return exports.greetstr+' from '+exports.namestr+'!';
// }

var Exports = function() {
	this.greet = function() {
		return exports.greetstr+' from '+exports.namestr+'!';
	}
}
exports = new Exports();

exports.greetstr = 'Hello world';

require('replacedsub').log();

exports.namestr = 'replaced exports';

