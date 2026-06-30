const { Exception } = require("../lang/Exception.cjs");

exports.IOException = class IOException extends Exception {
    name = "blaze.io.IOException";
};
