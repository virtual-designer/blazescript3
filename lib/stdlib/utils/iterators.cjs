const { ok } = require("node:assert");

const createRangeIterator = (
    from = 0,
    to = 0,
    fromInclusive = true,
    toInclusive = true,
    increment = 1
) => {
    ok(
        typeof from === "number" &&
            typeof to === "number" &&
            !Number.isNaN(from) &&
            !Number.isNaN(to),
        "Invalid range expression"
    );

    if (!fromInclusive) {
        from++;
    }

    if (!toInclusive) {
        to--;
    }

    return {
        [Symbol.iterator]: () => {
            return {
                next: () => {
                    if (from > to) {
                        return { value: undefined, done: true };
                    }

                    const value = from;
                    from += increment;

                    return {
                        value,
                        done: false
                    };
                }
            };
        }
    };
};

module.exports = {
    createRangeIterator
};
