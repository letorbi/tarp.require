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

// NOTE The load parameter points to the function, which prepares the
//      environment for each module and runs its code. Scroll down to the end of
//      the file to see the function definition.
(function() {
  'use strict';

  var cache = Object.create(null);
  var root = (new URL("./node_modules/", location.href)).href;

  function load(id, pwd, asyn) {
    // NOTE resolve href from id
    var matches, href;
    matches = id.match(/^((\.)?.*\/|)(.[^.]*|)(\..*|)$/);
    href = (new URL(
      matches[1] + matches[3] + (matches[3] && (matches[4] || ".js")),
      matches[2] ? pwd : root
    )).href;
    // NOTE load url into cache
    var cached, request;
    cached = cache[href] = cache[href] || {
      d: undefined, // deviation
      m: { // module
        children: undefined,
        exports: undefined,
        filename: href,
        id: href,
        loaded: false,
        parent: undefined,
        paths: [root],
        require: undefined,
        uri: href
      },
      p: undefined, // promise
      r: undefined // request
    };
    if (!cached.p) {
      cached.p = new Promise(function(res, rej) {
        request = cached.r = new XMLHttpRequest();
        request.onload = function() {
          var error, done, pattern, match, loaded = 0;
          if (request.status >= 400) {
            error = new Error(href + " " + request.status + " " + request.statusText);
            rej(error);
            throw error;
          }
          // NOTE Check for redirects and load package main, if it's defined.
          // TODO Duplicate or re-use cache entries if possible (see older version).
          if ((href = request.responseURL) != cached.m.uri)
            cached.d = /package\.json$/.test(href) ? (new URL(JSON.parse(request.responseText).main, href)).href: href;
          // NOTE Pre-load submodules if the request is asynchronous.
          if (asyn && !cached.d) {
            done = function() { if (--loaded <= 0) res(cached); };
            pattern = /require(?:\.resolve)?\((?:"((?:[^"\\]|\\.)+)"|'((?:[^'\\]|\\.)+)')\)/g;
            while((match = pattern.exec(request.responseText)) !== null) {
              loaded++;
              load(match[1]||match[2], href, true).then(done, done);
            }
          }
          if (loaded <= 0)
            res(cached);
        };
        request.onerror = function(evt) {
          rej(evt.details.error);
          throw evt.details.error;
        };
      });
    }
    // NOTE `request` is only defined if the module is requested for the first time.
    if (request || (!asyn && cached.r.status == 0)) {
      cached.r.abort();
      cached.r.open('GET', href, asyn);
      cached.r.send();
    }
    return asyn ? cached.p : cached;
  }

  function evaluate(cached, parent) {
    var module;
    if (!cached.m.exports) {
      module = cached.m;
      module.children = new Array(),
      module.exports = Object.create(null),
      module.parent = parent;
      module.require = factory(module);
      if (parent)
        parent.children.push(module);
      if (cached.r.getResponseHeader("Content-Type") == "application/json")
        module.exports = JSON.parse(cached.r.responseText);
      else
        (new Function(
          "exports,require,module,__filename,__dirname",
          cached.r.responseText + "\n//# sourceURL=" + module.uri
        ))(module.exports, module.require, module, module.id, module.id.match(/.*\//)[0]);
      module.loaded = true;
    }
    return cached.m;
  }

  function factory(parent) {
    function requireEngine(mode, id, asyn) {
      function afterLoad(cached) {
        if (cached.d) {
          return requireEngine(mode, cached.d, asyn);
        }
        else {
          switch (mode) {
            case 1:
              return cached.m.uri;
            case 2:
              return cached.m.paths;
            default:
              return evaluate(cached, parent).exports;
          }
        }
      }

      var pwd = parent ? parent.uri : location.href;
      return asyn ? new Promise(function(res, rej) {
        load(id, pwd, asyn)
          .then(afterLoad)
          .then(res, rej);
      }) : afterLoad(load(id, pwd, asyn));
    }

    var require = requireEngine.bind(undefined, 0);
    require.resolve = requireEngine.bind(require, 1);
    require.resolve.paths = requireEngine.bind(require.resolve, 2);
    return require;
  }

  self.require = factory(null);
})();
