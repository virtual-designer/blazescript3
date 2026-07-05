const { Exception } = require("../lang/Exception.cjs");

exports.IOException = class IOException extends Exception {
    getFullName() {
        return "blaze.io.IOException";
    }
};
