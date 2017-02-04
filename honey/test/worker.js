//
// This file is part of Smoothie.
//
// Copyright (C) 2013-2017 Torben Haase <https://pixelsvsbytes.com>
//
// Smoothie is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Smoothie is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Smoothie.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

"use strict";

var Honey = {
  'requirePath': ['./',"/alternative/module/root/"],
  'requirePreloaded': new Object(),
  'requireCompiler': function(source) {
    console.info("Fake require compiler called");
    return source;
  }
};
importScripts("../require.js");

var mod = require("module");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
