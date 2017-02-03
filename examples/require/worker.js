"use strict";

var Smoothie = {
  'main':null,
  'requirePath': ['./',"/alternative/module/root/"],
  'requirePreloaded': new Object(),
  'requireCompiler': function(source) {
    console.log("Fake require compiler called");
    return source;
  }
};

importScripts("../../standalone/require.js");

var mod = require("module");

self.addEventListener("message", function() {
  self.postMessage(mod.greet());
}, false);
