const { Exception } = require("../lang/Exception.cjs");

exports.ReflectionException = class ReflectionException extends Exception {
    getFullName() {
        return "blaze.reflection.ReflectionException";
    }
};
