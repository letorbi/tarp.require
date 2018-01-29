"use strict";

importScripts("../require.js");
var require = Tarp.require;

var mod = require("module1");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
