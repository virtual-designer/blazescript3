const { IOException } = require("./io/IOException.cjs");

Object.assign(exports, {
    lang: require("./lang/index.cjs"),
    io: require("./io/index.cjs"),
    utils: require("./utils/index.cjs")
});

Object.assign(globalThis, {
    print: exports.io.print,
    println: exports.io.println,
    readln: exports.io.readln,
    Unit: exports.lang.Unit,
    __blaze: exports
});
