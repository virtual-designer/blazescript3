exports.Throwable = Error;

exports.Exception = class Exception extends Error {
    getFullName() {
        return "blaze.lang.Exception";
    }
};
