//
// This file is part of //\ Tarp.
//
// Copyright (C) 2013-2017 Torben Haase <https://pixelsvsbytes.com>
//
// Tarp is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Tarp is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Tarp.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

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
