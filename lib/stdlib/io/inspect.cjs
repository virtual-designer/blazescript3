const { default: chalk } = require("chalk");
const util = require("node:util");
const Console = require("./console.cjs");
const originalInspect = util.inspect;

util.inspect = (object, options, ...args) => {
    const coloredUnit = options.colors
        ? typeof originalInspect.styles.undefined === "function"
            ? originalInspect.styles.undefined("Unit")
            : originalInspect.colors[originalInspect.styles.undefined]
                  .map((f, index) =>
                      index === 0 ? [`\x1b[${f}m`, "Unit"] : [`\x1b[${f}m`]
                  )
                  .flat()
                  .join("")
        : "Unit";

    if (object === Unit) {
        return coloredUnit;
    }

    return originalInspect(object, options, ...args);
};

exports.inspect = util.inspect;
exports.originalConsole = console;
exports.originalInspect;

globalThis.console = new Console(process.stdout, process.stderr);
