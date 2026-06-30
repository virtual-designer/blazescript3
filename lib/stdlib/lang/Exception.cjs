exports.Throwable = Error;

exports.Exception = class Exception extends Error {
    name = "blaze.lang.Exception";
};
