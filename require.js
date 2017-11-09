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

  var cache = {};

  function load(id, pwd, asyn) {
    // NOTE resolve url from id
    var matches, url;
    matches = id.match(/^((\.)?.*\/|)(.[^.]*|)(\..*|)$/);
    url = new URL(
      matches[1] + matches[3] + (matches[3] && (matches[4] || ".js")),
      matches[2] ? pwd : self.require.root
    );
    // NOTE load url into cache
    var cached, request;
    cached = cache[url.href] = cache[url.href] || {
      redirect: undefined,
      module: undefined,
      promise: undefined,
      request: undefined,
      url: url
    };
    if (!cached.promise) {
      cached.promise = new Promise(function(res, rej) {
        request = cached.request = new XMLHttpRequest();
        request.addEventListener("load", function() {
          var done, error, loaded = 0, match, pattern;
          if (request.status >= 400) {
            error = new Error(url + " " + request.status + " " + request.statusText);
            rej(error);
            throw error;
          }
          if ((url.href != request.responseURL)) {
            if (/package\.json$/.test(request.responseURL)) {
              cached.redirect = (new URL(JSON.parse(request.responseText).main, url.href)).href;
            }
            else
              cached.redirect = request.responseURL;
          }
          if (asyn && !cached.redirect) {
            done = function() { if (--loaded <= 0) res(cached); };
            pattern = /require(?:\.resolve)?\((?:"((?:[^"\\]|\\.)+)"|'((?:[^'\\]|\\.)+)')\)/g;
            while((match = pattern.exec(request.responseText)) !== null) {
              loaded++;
              load(match[1]||match[2], url.href, true).then(done, done);
            }
          }
          if (loaded <= 0)
            res(cached);
        });
        request.addEventListener("error", function(evt) {
          rej(evt.details.error);
          throw evt.details.error;
        });
      });
    }
    // NOTE `request` is only defined if the module is requested for the first time.
    if (request || (!asyn && cached.request.status == 0)) {
      cached.request.abort();
      cached.request.open('GET', url.href, asyn);
      cached.request.send();
    }
    return asyn ? cached.promise : cached;
  }

  function evaluate(cached, parent) {
    var module;
    if (!cached.module) {
      module = cached.module = {
        children: new Array(),
        exports: Object.create(null),
        filename: cached.url.href,
        id: cached.url.pathname,
        loaded: false,
        parent: parent,
        require: undefined,
        uri: cached.url.href
      };
      module.require = factory(module);
      if (parent)
        parent.children.push(module);
      if (cached.request.getResponseHeader("Content-Type") == "application/json")
        module.exports = JSON.parse(cached.request.responseText);
      else
        (new Function(
          "exports,require,module,__filename,__dirname",
          cached.request.responseText + "\n//# sourceURL=" + cached.url.href
        ))(module.exports, module.require, module, cached.url.href, cached.url.href.match(/.*\//)[0]);
      module.loaded = true;
    }
    return cached.module;
  }

  function factory(parent) {
    var require = function(id, asyn) {
      var pwd = parent ? parent.uri : location.href;
      if (asyn) {
        return new Promise(function(res, rej) {
          load(id, pwd, asyn)
            .then(function(cached) {
              return cached.redirect ? require(cached.redirect, asyn) : evaluate(cached, parent).exports;
            }, rej) // TODO Is `rej` required hre or will errors handled by the second `rej`?
            .then(res, rej);
        });
      }
      else {
        var cached = load(id, pwd, asyn);
        return cached.redirect ? require(cached.redirect, asyn) : evaluate(cached, parent).exports;
      }
    };
    require.resolve = function(id, asyn) {
      var pwd = parent ? parent.uri : location.href;
      if (asyn) {
        return new Promise(function(res, rej) {
          load(id, pwd, asyn)
            .then(function(cached) {
              return cached.redirect ? require.resolve(cached.redirect, asyn) : cached.url.href;
            }, rej) // TODO Is `rej` required hre or will errors handled by the second `rej`?
            .then(res, rej);
        });
      }
      else {
        var cached = load(id, pwd, asyn);
        return cached.redirect ? require.resolve(cached.redirect, asyn) : cached.url.href;
      }
    };
    return require;
  }

  (self.require = factory(null)).root = (new URL("./node_modules/", location.href)).href;
})();
