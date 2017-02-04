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

// INFO Current module descriptors
//      pwd[0] contains the descriptor of the currently loaded module,
//      pwd[1] contains the descriptor its parent module and so on.

var pwd = Array();

// INFO Path parser
//      Older browsers don't support the URL interface, therefore we use an
//      anchor element as parser in that case. Thes breaks web worker support,
//      but we don't care since these browsers also don't support web workers.

var parser = new URL(location.href);

// INFO Module cache
//      Contains getter functions for the exports objects of all the loaded
//      modules. The getter for the module 'mymod' is name '$name' to prevent
//      collisions with predefined object properties (see note below).
//      As long as a module has not been loaded the getter is either undefined
//      or contains the module code as a function (in case the module has been
//      pre-loaded in a bundle).

var cache = new Object();

// INFO Tarp options
//      The values can be set by defining a object called Tarp. The
//      Tarp object has to be defined before this script here is loaded
//      and changing the values in the Tarp object will have no effect
//      afterwards!

var requirePath = self.Tarp&&self.Tarp.requirePath!==undefined ? self.Tarp.requirePath.slice(0) : ['./'];

// NOTE Parse module root paths
var base = [location.origin, location.href.substr(0, location.href.lastIndexOf("/")+1)];
for (var i=0; i<requirePath.length; i++) {
  if (!/^(?:\w+:)?\/\//.test(requirePath[i]))
    parser.href = (requirePath[i][0]=="."?base[1]:base[0])+requirePath[i];
  else
    parser.href = requirePath[i];
  requirePath[i] = parser.href;
}

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
  var descriptor = resolve(identifier);
  var cacheid = '$'+descriptor.id;

  if (cache[cacheid]) {
    if (typeof cache[cacheid] === 'string')
      load(descriptor, cache, pwd, cache[cacheid]);
    return cache[cacheid];
  }

  var request = new XMLHttpRequest();
  request.open('GET', descriptor.uri, false);
  request.send();
  if (request.status != 200)
    throw new Error("Tarp: unable to load "+descriptor.id+" ("+request.status+" "+request.statusText+")");
  var source = 'function(){\n'+request.responseText+'\n}';
  load(descriptor, cache, pwd, source);
  return cache[cacheid];
}

// INFO Module resolver
//      Takes a module identifier and resolves it to a module id and URI. Both
//      values are returned as a module descriptor, which can be passed to
//      `fetch` to load a module.

function resolve(identifier) {
  // NOTE Matches [1]:[..]/[path/to/][file][.js]
  var m = identifier.match(/^(?:([^:\/]+):)?(\.\.?)?\/?((?:.*\/)?)([^\.]+)?(\..*)?$/);
  // NOTE Matches [1]:[/path/to/]file.js
  var p = (pwd[0]?pwd[0].id:"").match(/^(?:([^:\/]+):)?(.*\/|)[^\/]*$/);
  var root = m[2] ? requirePath[p[1]?parseInt(p[1]):0] : requirePath[m[1]?parseInt(m[1]):0];
  parser.href = (m[2]?root+p[2]+m[2]+'/':root)+m[3]+(m[4]?m[4]:'index');
  var uri = parser.href+(m[5]?m[5]:'.js');
  if (uri.substr(0,root.length) != root)
    throw new Error("Tarp: relative identifier outside of module root");
  var id = (m[1]?m[1]+":":"0:")+parser.href.substr(root.length);
  return {'id':id,'uri':uri};
}

// NOTE Export require to global scope

if (self.require !== undefined)
  throw new Error("Tarp: '\'require\' already defined in global scope");

Object.defineProperty(self, 'require', {'value':require});
Object.defineProperty(self.require, 'resolve', {'value':resolve});
Object.defineProperty(self.require, 'path', {'get':function(){return requirePath.slice(0);}});

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
  var global = self;
  var exports = new Object();
  Object.defineProperty(module, 'exports', {'get':function(){return exports;},'set':function(e){exports=e;}});
  arguments[2].unshift(module);
  Object.defineProperty(arguments[1], '$'+module.id, {'get':function(){return exports;}});
  arguments[3] = '('+arguments[3]+')();\n//# sourceURL='+module.uri;
  eval(arguments[3]);
  // NOTE Store module code in the cache if the loaded file is a bundle
  if (typeof module.id !== 'string')
    for (var id in module)
      arguments[1]['$'+require.resolve(id).id] = module[id].toString();
  arguments[2].shift();
}

);
