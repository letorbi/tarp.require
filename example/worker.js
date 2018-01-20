"use strict";

var Tarp = {
  'requirePath': ['./',"/alternative/module/root/"],
  'requirePreloaded': new Object(),
  'requireCompiler': function(source) {
    console.info("Fake require compiler called");
    return source;
  }
};
importScripts("../require.js");

var mod = require("module1");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
