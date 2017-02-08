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
(function(load) { 'use strict';

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

var pwd, parser, cache, path, i;

// INFO Current module descriptors
//      pwd[0] contains the descriptor of the currently loaded module,
//      pwd[1] contains the descriptor its parent module and so on.

pwd = Array();

// INFO Path parser
//      Older browsers don't support the URL interface, therefore we use an
//      anchor element as parser in that case. Thes breaks web worker support,
//      but we don't care since these browsers also don't support web workers.

parser = new URL(location.href);

// INFO Module cache
//      Contains getter functions for the exports objects of all the loaded
//      modules. The getter for the module 'mymod' is name '$name' to prevent
//      collisions with predefined object properties (see note below).
//      As long as a module has not been loaded the getter is either undefined
//      or contains the module code as a function (in case the module has been
//      pre-loaded in a bundle).

cache = new Object();

// INFO Tarp options
//      The values can be set by defining a object called Tarp. The
//      Tarp object has to be defined before this script here is loaded
//      and changing the values in the Tarp object will have no effect
//      afterwards!

path = self.Tarp&&self.Tarp.requirePath!==undefined ? self.Tarp.requirePath.slice(0) : ['./'];

// NOTE Parse module root paths
for (i=0; i<path.length; i++)
  path[i] = (new URL(path[i], location.href)).href;

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
  var descriptor, cacheid, request;
  descriptor = resolve(identifier);
  cacheid = '$'+descriptor.id;
  if (cache[cacheid]) {
    if (typeof cache[cacheid] === 'string')
      load(descriptor, cache, pwd, cache[cacheid]);
    return cache[cacheid];
  }
  request = new XMLHttpRequest();
  request.open('GET', descriptor.uri, false);
  request.send();
  if (request.status != 200)
    throw new Error("Tarp: unable to load "+descriptor.id+" ("+request.status+" "+request.statusText+")");
  load(descriptor, cache, pwd, 'function(){\n'+request.responseText+'\n}');
  return cache[cacheid];
}

// INFO Module resolver
//      Takes a module identifier and resolves it to a module id and URI. Both
//      values are returned as a module descriptor, which can be passed to
//      `fetch` to load a module.

function resolve(identifier) {
  var m, base, root, uri;
  // NOTE Matches [1]:([../rel/path]|[path/to/])[file][.js]
  m = identifier.match(/^(?:([^:\/]+):)?(?:(\..*\/)|\/?(.*\/))?([^\.]+)?(\..*)?$/);
  root = m[3] || !pwd[0] ? path[parseInt(m[1] || 0)] : pwd[0].root;
  base = pwd[0] && m[2] ? pwd[0].uri : root;
  uri = (new URL("./" + (m[2] || m[3] || "") + (m[4] || "index"), base)).href;
  if (uri.substr(0,root.length) != root)
    throw new Error("TarpX: relative identifier outside of module root");
  return {
    id: (m[1] || "0") + ":" + uri.substr(root.length),
    uri: uri + (m[5] || ".js"),
    root: root
  };
}

// NOTE Export require to global scope

if (self.require !== undefined)
  throw new Error("Tarp: '\'require\' already defined in global scope");
Object.defineProperty(self, 'require', {'value':require});
Object.defineProperty(self.require, 'resolve', {'value':resolve});
Object.defineProperty(self.require, 'path', {'get':function(){return path.slice(0);}});

})(

// INFO Module loader
//      Takes the module descriptor, the global variables and the module code,
//      sets up the module envirinment, defines the module getter in the cache
//      and evaluates the module code. If module is a bundle the code of the
//      pre-loaded modules will be stored in the cache afterwards.
// NOTE This functions is defined as an anonymous function, which is passed as
//      a parameter to the closure above to provide a clean environment (only
//      global variables, module and exports) for the loaded module. This is
//      also the reason why `source`, `pwd` & `cache` are not named parameters.
// NOTE If we would strict use mode here, the evaluated code would be forced to be
//      in strict mode, too.

function /*load*/(module/*, cache, pwd, source*/) {
  var global, exports;
  global = self;
  exports = new Object();
  Object.defineProperty(module, 'exports', {'get':function(){return exports;},'set':function(e){exports=e;}});
  Object.defineProperty(arguments[1], '$'+module.id, {'get':function(){return exports;}});
  arguments[2].unshift(module);
  eval('('+arguments[3]+')();\n//# sourceURL='+module.uri);
  // NOTE Store module code in the cache if the loaded file is a bundle
  if (module.bundle)
    for (var id in exports)
      arguments[1]['$'+require.resolve(id).id] = exports[id].toString();
  arguments[2].shift();
}

);
