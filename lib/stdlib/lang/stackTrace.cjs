const { Exception } = require("./Exception.cjs");

const originalPrepareStackTrace = Error.prepareStackTrace;

Error.prepareStackTrace = (error, stackTraces) => {
    let str = "";

    if (error instanceof Exception) {
        str += `${error.getFullName()}: ${error.message}\n`;
    } else {
        str += `${error.name}: ${error.message}\n`;
    }

    const trace =
        originalPrepareStackTrace.call(Error, error, stackTraces) + "";
    const newline = trace.indexOf("\n");
    return str + trace.substring(newline + 1);
};
