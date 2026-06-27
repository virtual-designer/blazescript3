const inspect = require("./inspect.cjs");

function println(...args) {
    console.info(...args);
}

module.exports = {
    println,
    inspect
};
