var modules = require(['./module2','./module3']);

exports.greet = function() {
    return "This is module1, "+modules[0]()+" and "+modules[1]()+"!";
}
