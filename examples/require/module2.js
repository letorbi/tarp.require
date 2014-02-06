var module1 = require('./module1');
module.exports = function() {
    return module1()+" and this is module2!";
};
