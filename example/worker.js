"use strict";

importScripts("../require.js");

var mod = require("module1");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
