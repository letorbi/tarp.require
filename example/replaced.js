//
// This file is part of Tarp.
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

'use strict';

// this.greet = function() {
//   return exports.greetstr+' from '+exports.namestr+'!';
// }

var Exports = function() {
  this.greet = function() {
    return exports.greetstr+' from '+exports.namestr+'!';
  };
};
exports = new Exports();

exports.greetstr = 'Hello world';

require('replacedsub').log();

exports.namestr = 'replaced exports';

