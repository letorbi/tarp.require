//\ Tarp.require - a lightweight JavaScript module loader
=========================================================
Tarp.require is a CommonJS and Node.js compatible module loader licensed as open source under the LGPL v3. It aims to be
as lightweight as possible while not missing any features.

**Important notice:** Tarp.require is still work in progress. This means that even though the code that has been pushed
to GitHub should work in general, some issues might slip through. Also the implementation itself might go though bigger
changes during the development of new features. The plan is to have a stable version by the end of 2017. The tarp-branch
will then become the new master-branch of this repository. Until then I would recommend to use the current
"Smoothie" master-branch, if you need a more stable version.

## Features

* **Compatible** NodeJS 9.2.0 and CommonJS modules 1.1
* **Plain** No dependencies, no need to compile/bundle/etc the modules
* **Asynchronous** Non-blocking loading of module files
* **Modern** Makes use of promises and other features (support for older browsers via polyfills)
* **Lightweight** Just 150 lines of code, minified version is about 1.7kB

## Installation

NPM and bower packages will be available once the first stable version has been released. For now just clone the
repository directly or add it to your git repository as a submodule:

```
$ git submodule add -b tarp https://github.com/letorbi/smoothie.git tarp-require
```

## Usage

Assuming you've installed Tarp.require in the folder */tarp-require* (*/* is the root-folder of your website), you only
have to add the following line to your HTML to load Tarp.require:

```
<script src"/tarp-require/require.min.js"></script>
```

It is recommended move the JavaScript of your page into a main-module to have a proper environment. Just move any
existing scripts into a file */main.js* (or anything else) and load this main-module with:

```
Tarp.require("/main", true); // 'true' tells require to load the module asynchronously
```

Inside any module you can use `require()` as you know it from NodeJS. Assuming you're in the module */scripts/someModule* the module-IDs will be resolved to the following paths:

```
var myModule1 = require("anotherModule1");   // loads /node_modules/anotherModule1.js
var myModule2 = require("/anotherModule2");  // loads /anotherModule2.js
var myModule2 = require("./anotherModule3"); // loads /scripts/anotherModule3.js

```

## Synchronous and asynchronous loading

Tarp.require supports synchronous and asynchronous loading of modules. The default mode is synchronous loading to ensure
compatibility with NodeJS and CommonJS. However, asynchronous loading can be easily activated by adding a second
parameter that resolves to `true` to the call:

```
// synchronous loading
var someModule = require("someModule");
someModule.someFunc();

 // asynchronous loading
require("anotherModule", true).then(function(anotherModule) {
    anotherModule.anotherFunc();
});
```

Please note that thanks to the asynchronous preloading feature of tarp.require you will usually need the asynchronous
loading pattern only once per page.

### Asynchronous preloading

An asynchronous call of `require()` will not only try to load the module itself, but also any required submodules
asynchronously. Even though the code of a submodule has been downloaded, it will not be executed, until the
require-call for that submodule is actually reached. So the execution-order is the same as if the modules were loaded
asynchronously.

This way it is usually enough to load the main-module of a page asynchronously and all other modules required for that
page will be loaded asynchronously as well.

Right now only plain require-calls are pre-loaded. This means that the ID of the module has to be one simple string.
Also require-calls with more than one parameter are ignored (since they are usually asynchronous calls by themselves).

**Example:** If *Module1* is required asynchronously and contains the require calls `require("Submodule1")`,
`require("Submodule2", true)` and `require("Submodule" + "3")` somehwere in its code, only *Submodule1* will be
pre-loaded, since the require-call for *Submodule2* has more than one parameter and the ID in the require-call  for
*Submodule3* is not one simple string.



Copyright 2013-2017 Torben Haase [\<https://pixelsvsbytes.com/\>](https://pixelsvsbytes.com/).
