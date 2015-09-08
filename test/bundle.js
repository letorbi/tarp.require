//
// This file is part of Honey Require
//
// Copyright (c) 2015 Torben Haase
//
// Honey Require is free software: you can redistribute it and/or modify it
// under the terms of the MIT License (MIT).
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// You should have received a copy of the MIT License along with Honey Require.
// If not, see <https://opensource.org/licenses/MIT>.
//
////////////////////////////////////////////////////////////////////////////////

!window.Honey && (window.Honey = new Object()); 
!window.Honey.requirePreloaded && (window.Honey.requirePreloaded = new Object());
module = typeof module=='undefined' ? Honey.requirePreloaded : new Object(); 

module['moduleA'] = function() {
    'use strict';

    exports.hellostr = 'hello';

    exports.greet = function() {
        return exports.hellostr+' world from '+module.id+'!';
    }
}

module['moduleB'] = function() {
    'use strict';

    exports.worldstr = 'world';

    exports.greet = function() {
        return 'hello '+exports.worldstr+' from '+module.id+'!';
    }
}
