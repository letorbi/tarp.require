//
// This file is part of //\ Tarp.
//
// Copyright (C) 2013-2018 Torben Haase <https://pixelsvsbytes.com>
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
(self.Tarp = self.Tarp || {}).require = function(config) {
  "use strict";

  function load(id, pwd, asyn) {
    var href, cached, request;
    href = (new URL(id, pwd)).href;
    cached = cache[href] = cache[href] || {
      e: undefined, // error
      m: undefined, // module
      p: undefined, // promise
      r: undefined, // request
      s: undefined, // source
      t: undefined, // type
      u: href, // url
    };
    if (!cached.p) {
      cached.p = new Promise(function(res, rej) {
        request = cached.r = new XMLHttpRequest();
        request.onload = request.onerror = function() {
          var tmp;
            // `request` might have been changed by line 54.
          if (request = cached.r) {
            cached.r = null;
            if ((request.status > 99) && ((href = request.getResponseHeader("Content-Location") || href) != cached.u)) {
              if (cache[href]) {
                cached = cache[cached.u] = cache[href];
                cached.p.then(res, rej);
                // NOTE Replace pending request of actual module with the already completed request and abort the
                //      pending request.
                if (cached.r) {
                  tmp = cached.r;
                  cached.r = request;
                  tmp.abort();
                  tmp.onload();
                }
                return;
              }
              else {
                cached.u = href;
                cache[href] = cached;
              }
            }
            if ((request.status > 99) && (request.status < 400)) {
              cached.s = request.responseText;
              cached.t = request.getResponseHeader("Content-Type");
              res(cached);
            }
            else {
              rej(cached.e = new Error(href + " " + request.status));
            }
          }
        };
      });
    }
    // NOTE `request` is only defined if the module is requested for the first time.
    if (request = request || (!asyn && cached.r)) {
      try {
        request.abort();
        request.$ = asyn;
        // NOTE IE requires a true boolean value as third param.
        request.open("GET", href, !!asyn);
        request.send();
      }
      catch (e) {
        request.onerror();
      }
    }
    if (cached.e)
      throw cached.e;
    return cached;
  }

  function preload(cached) {
    return new Promise(function(res) {
      var match, loading = 0, pattern, pwd, source, tmp;
      function done() { if (--loading < 0) res(cached); };
      pattern = /require(?:\.resolve)?\((?:"((?:[^"\\]|\\.)+)"|'((?:[^'\\]|\\.)+)')\)/g;
      // NOTE Remove comments from the source
      source = cached.s.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
      // TODO Write a real parser that returns all modules that are preloadable.
      pattern = /require\s*(?:\.\s*resolve\s*(?:\.\s*paths\s*)?)?\(\s*(?:"((?:[^"\\]|\\.)+)"|'((?:[^'\\]|\\.)+)')\s*\)/g;
      while((match = pattern.exec(source)) !== null) {
        pwd = (new URL((match[1]||match[2])[0] == "." ? cached.u : config.paths[0], root)).href;
        // NOTE Only add modules to the loading-queue that are still pending.
        if ((tmp = load(match[1]||match[2], pwd, true)).r) {
          loading++;
          tmp.p.then(done, done);
        }
      }
      done();
    });
  }

  function evaluate(cached, parent) {
    var module;
    if (!cached.m) {
      module = cached.m = {
        children: new Array(),
        exports: Object.create(null),
        filename: cached.u,
        id: cached.u,
        loaded: false,
        parent: parent,
        paths: config.paths.slice(),
        require: undefined,
        uri: cached.u
      },
      module.require = factory(module);
      parent && parent.children.push(module);
      if (cached.t == "application/json")
        module.exports = JSON.parse(cached.s);
      else
        (new Function(
          "exports,require,module,__filename,__dirname",
          cached.s + "\n//# sourceURL=" + module.uri
        ))(module.exports, module.require, module, module.uri, module.uri.match(/.*\//)[0]);
      module.loaded = true;
    }
    return cached.m;
  }

  function factory(parent) {
    function requireEngine(mode, id, asyn) {
      function afterLoad(cached) {
        var regex = /package\.json$/;
        if (regex.test(cached.u) && !regex.test(id)) {
          var pkg = evaluate(cached, parent);
          return typeof pkg.exports.main == "string" ?
            (factory(pkg))(pkg.exports.main, asyn):
            pkg.exports;
        }
        else if (mode == 1)
          return cached.u;
        else if (mode == 2)
          return [pwd.match(/.*\//)[0]];
        else
          return evaluate(cached, parent).exports;
      }

      var pwd = (new URL(id[0] == "." ? (parent ? parent.uri : root) : config.paths[0], root)).href;
      return asyn ?
        new Promise(function(res, rej) {
          load(id, pwd, asyn).p.then(preload).then(afterLoad).then(res, rej);
        }):
        afterLoad(load(id, pwd, asyn));
    }

    var require = requireEngine.bind(undefined, 0);
    require.resolve = requireEngine.bind(require, 1);
    require.resolve.paths = requireEngine.bind(require.resolve, 2);
    return require;
  }

  var cache, root;
  cache = Object.create(null);
  config = config || new Object();
  config.paths = config.paths || ["./node_modules/"];
  root = new URL(config.main, location.origin);
  return (factory(null))(config.main, !config.sync);
};
