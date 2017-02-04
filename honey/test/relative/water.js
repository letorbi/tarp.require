//
// This file is part of Smoothie.
//
// Copyright (C) 2013-2017 Torben Haase <https://pixelsvsbytes.com>
//
// Smoothie is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Smoothie is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Smoothie.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

!window.Smoothie && (window.Smoothie = new Object()); 
!window.Smoothie.preloaded && (window.Smoothie.preloaded = new Object()); 
module = typeof module=='undefined' ? Smoothie.preloaded : new Object(); 

module['fish'] = function() {
  exports.greet = function() {
    return "Hello from fish";
  };
};

module['./shark'] = function() {
  exports.greet = function() {
    return "Hello from shark";
  };
};

module['../whale'] = function() {
  exports.greet = function() {
    return "Hello from whale";
  };
};

module['ocean/dolphin'] = function() {
  exports.greet = function() {
    return "Hello from dolphin";
  };
};
