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

// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(function() { 'use strict';

// NOTE Mozilla still sets the wrong fileName property for errors that occur
//      inside an eval call (even with sourceURL). However, the stack
//      contains the correct source, so it can be used to re-threw the error
//      with the correct fileName property.
// WARN Re-throwing an error object will mess up the stack trace and the
//      column number.
if (typeof (new Error()).fileName == "string") {
  self.addEventListener("error", function(evt) {
    if (evt.error instanceof Error) {
      if (pwd[0]) {
        evt.preventDefault();
        throw new evt.error.constructor(evt.error.message, pwd[0].uri, evt.error.lineNumber);
      }
      else {
        var m = evt.error.stack.match(/^[^\n@]*@([^\n]+):\d+:\d+/);
        if (m === null) {
          console.warn("Tarp: unable to read file name from stack");
        }
        else if (evt.error.fileName != m[1]) {
          evt.preventDefault();
          throw new evt.error.constructor(evt.error.message, m[1], evt.error.lineNumber);
        }
      }
    }
  }, false);
}

var root, pwd, cache;

// INFO Module root
//      Module identifiers starting with neither '/' nor '.' are resolved
//      from the module root. The module root can be changed at any time
//      by setting require.root. Already loaded modules won't be affected
//      from the change. Relative and absolute root paths are accepted, the
//      default value is the URI of the document that loaded require.

// INFO Current module path
//      pwd[0] contains the URI of the currently loaded module,
//      pwd[1] contains the URI its parent module and so on.

pwd = [location.href];

// INFO Module cache
//      Contains getter functions for the exports objects of all the loaded
//      modules. As long as a module has not been loaded the getter is either
//      undefined or contains the module code as a string (in case the
//      module has been pre-loaded in a bundle).

cache = Object.create(null);

// INFO Module getter
//      Takes a module identifier, resolves it and gets the module code via an
//      AJAX request from the module URI. If this was successful the code and
//      some environment variables are passed to the load function. The return
//      value is the module's `exports` object. If the cache already
//      contains an object for the module id, this object is returned directly.
// NOTE If a callback function has been passed, the AJAX request is asynchronous
//      and the mpdule exports are passed to the callback function after the
//      module has been loaded.

function require(identifier) {
  var module, request, exports;
  module = resolve(identifier);
  if (cache[module.uri] === undefined) {
    request = new XMLHttpRequest();
    request.open('GET', module.uri, false);
    request.send();
    if (request.status != 200)
      throw new Error("Tarp: Loading "+module.uri+" returned: "+request.status+" "+request.statusText);
    exports = Object.create(null);
    Object.defineProperty(module, 'exports', {'get':function(){return exports;},'set':function(e){exports=e;}});
    Object.defineProperty(cache, module.uri, {'get':function(){return exports;}});
    pwd.unshift(module.uri);
    (new Function("module, exports, global", request.responseText + "\n//# sourceURL=" + module.uri))
      .call(self, module, exports, self);
    pwd.shift();
  }
  return cache[module.uri];
}

// INFO Module resolver
//      Takes a module identifier and resolves it to a module id and URI. Both
//      values are returned as a module descriptor, which can be passed to
//      `fetch` to load a module.

function resolve(identifier) {
  var m, base, url;
  // NOTE Matches [[.]/path/to/][file][.js]
  m = identifier.match(/^((\.)?.*\/|)(.[^\.]*)?(\..*)?$/);
  base = m[2] ? pwd[0] : root;
  url = new URL(m[1] + (m[3] || "index") + (m[4] || ".js"), base);
  return {
    id: url.pathname,
    uri: url.href
  };
}

// NOTE Export require to global scope

if (self.require !== undefined)
  throw new Error("Tarp: '\'require\' already defined in global scope");
self.require = require;
self.require.resolve = resolve;
Object.defineProperty(self.require, 'root', {
  get: function() { return root; },
  set: function(r) { root = (new URL(r, location.href)).href; }
});

self.require.root = "./node_modules/";

})();
