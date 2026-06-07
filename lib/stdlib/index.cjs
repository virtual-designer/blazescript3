Object.assign(exports, require("./io/index.cjs"));

Object.assign(globalThis, {
    println: exports.println
});
