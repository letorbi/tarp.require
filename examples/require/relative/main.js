'use strict';

var sub = require('./sub.js');

exports.greet = function() {
	return 'Hello from main! '+sub.greet();
}
