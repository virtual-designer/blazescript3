require("./init/init.cjs");

Object.assign(exports, {
    io: require("./io/index.cjs"),
    utils: require("./utils/index.cjs"),
});

Object.assign(globalThis, {
    println: exports.io.println,
    __blaze: exports
});
