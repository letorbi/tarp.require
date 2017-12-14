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

Tarp.require supports synchronous and asynchronous loading of modules. The default mode is synchronous loading to
ensure compatibility with NodeJS and CommonJS. However, asynchronous loading can be easily activated by adding a second
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

Please note that thanks to the asynchronous pre-loading feature of Tarp.require you will usually need the asynchronous
loading pattern only once per page.

### Asynchronous pre-loading

An asynchronous call of `require()` will not only try to load the module itself, but will also try to pre-load any
required submodules asynchronously. This way it is usually enough to load the main-module of a page asynchronously
and all other modules required for that page will be loaded asynchronously as well.

Pre-loading means, that even though the code of a submodule has been downloaded, it will not be executed, until the
require-call for that submodule is actually reached. So the execution-order is the same as if the modules were loaded
asynchronously.

Right now only plain require-calls are pre-loaded. This means that the ID of the module has to be one simple string.
Also require-calls with more than one parameter are ignored (since they are usually asynchronous calls by themselves).

**Example:** If *Module1* is required asynchronously and contains the require calls `require("Submodule1")`,
`require("Submodule2", true)` and `require("Submodule" + "3")` somewhere in its code, only *Submodule1* will be
pre-loaded, since the require-call for *Submodule2* has more than one parameter and the module-ID in the require-call
for *Submodule3* is not one simple string.

## Path resolving

Unlike the Node.js implementation Tarp.require will not search through a number of paths, if a module-file cannot be
found, but will simply fail with an error. This is due to the fact that Tarp.require usually tries to load files from a
remote location and searching through remote paths by requesting each probable location of a file would be very
time-consuming. Tarp.require relies on the server to resolve unknown files instead.

The only occation when Tarp.require executes a redirect on its own is, when the module-ID points to a path that is
redirected to a *package.json* file that conatins a `main` field. See the following sections for details.

### HTTP redirects

Tarp.require is able to handle temporary (301) and permanent (303) HTTP redirects. A common case where redirects might
be handy is to use *package.json* as the default file if an ID without a filename is requested. To achieve that you
could use the following NGINX redirect rule:

``
rewrite /node_modules/.*/$ package.json redirect;
``

This will redirect all requests like */node_modules/path/* to */node_modules/path/package.json*. Keep in
mind that you have to extend the rule, if you also want to redirect requests like */node_modules/path* (no trailing
slash) to */node_modules/path/package.json*.

### NPM packages

Tarp.require loads module-IDs specified the `main` field of a *package.json* file, if the following things are true:

 1. The *package.json* file is loaded via a redirect (like explained in the section above)
 2. The response contains a valid JSON object 
 3. The object has a property called `main`
 
If that is the case a second request will be triggered to load the modules specified in `main` and the exports of
that module will be returned. Otherwise simply the content of *package.json* is returned.

### The `paths` property

Tarp.require supports the `module.paths` property that contains an editable array of paths and the
`require.resolve.paths(id)` function that return the `module.paths` property for the given module-ID.

However, adding more items to the `paths` array won't make Tarp.require to request multiple locations. Only `paths[0]`
will be used to resolve module-IDs. Changing `paths[0]` will change resolving-behaviour for that module, but all other
modules will not be affected.

----

Copyright 2013-2017 Torben Haase [\<https://pixelsvsbytes.com/\>](https://pixelsvsbytes.com/).
