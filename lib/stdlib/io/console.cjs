const util = require("util");

module.exports = class Console extends console.Console {
    Console = Console;

    #print(fn, stream, ...args) {
        fn.call(
            this,
            args.map(arg =>
                typeof arg === "string"
                    ? arg
                    : util.inspect(arg, { colors: stream.isTTY })
            ).join(' ')
        );
    }

    log(...args) {
        this.#print(super.log, process.stdout, ...args);
    }

    info(...args) {
        this.#print(super.info, process.stdout, ...args);
    }

    trace(...args) {
        super.trace(...args);
    }

    warn(...args) {
        this.#print(super.warn, process.stderr, ...args);
    }

    error(...args) {
        this.#print(super.error, process.stderr, ...args);
    }
};
