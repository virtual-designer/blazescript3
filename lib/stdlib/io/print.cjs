const { IOException } = require("./IOException.cjs");
const { inspect } = require("./inspect.cjs");

const println = (...args) => {
    console.info(...args);
};

const print = (...args) => {
    let str = "";

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        str +=
            (i > 0 ? " " : "") +
            (typeof arg === "string"
                ? arg
                : inspect(arg, {
                      colors: true
                  }));
    }

    process.stdout.write(str);
};

const readln = prompt => {
    if (prompt !== undefined) {
        process.stdout.write(prompt);
    }

    let buffer = "";
    let resolved = false;

    return new Promise((resolve, reject) => {
        const callback = () => {
            if (resolved) {
                return;
            }

            const data = process.stdin.read();

            if (data === null) {
                return;
            }

            if (typeof data !== "string" && !Buffer.isBuffer(data)) {
                process.stdin.removeListener("readable", callback);
                reject(new IOException("Invalid type of data received"));
                return;
            }

            const newlineIndex = data.indexOf("\n");

            buffer +=
                newlineIndex === -1
                    ? data
                    : typeof data === "string"
                      ? data.substring(0, newlineIndex)
                      : data.toString("utf8", 0, newlineIndex);

            const chunk =
                newlineIndex === -1
                    ? null
                    : typeof data === "string"
                      ? data.substring(newlineIndex + 1)
                      : data.toString("utf8", newlineIndex + 1);

            if (chunk?.length) {
                process.stdin.push(chunk);
            }

            if (newlineIndex !== -1) {
                process.stdin.removeListener("readable", callback);
                resolved = true;
                resolve(buffer);
                return;
            }
        };

        process.stdin.on("readable", callback);
    });
};

Object.assign(module.exports, {
    println,
    readln,
    print
});
