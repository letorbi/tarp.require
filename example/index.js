var mod1 = require('module1');
console.log(mod1.greet());
mod1.greetstr = 'HELLO WORLD';
//var mod2 = require('module2');
//console.log(mod2.greet());
var mod3 = require('module3');
console.log(mod3.greet());

var mod = require('./module');
console.log(mod.greet());

var mod = require('module1');
console.log(mod.greet());

mod = require('relative/main');
console.log(mod.greet());
