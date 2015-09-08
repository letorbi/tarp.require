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

'use strict';

var fromstr = 'from'

exports.greetstr = 'hello world';

exports.greet = function() {
    return exports.greetstr+' '+fromstr+' '+module.id+'!';
}
