class BitField<T extends number> {
    private bits: number = 0;

    public constructor(bits?: undefined);
    public constructor(bits?: T);
    public constructor(bits?: Iterable<T>);

    public constructor(bits: T | Iterable<T> = 0 as T) {
        this.bits =
            typeof bits === "number"
                ? bits
                : Array.from(bits).reduce((acc, value) => (acc |= value), 0);
    }

    public all() {
        return this.bits;
    }

    public has(mask: T) {
        return (this.bits & mask) === mask;
    }

    public set(mask: T) {
        this.bits |= mask;
    }

    public unset(mask: T) {
        this.bits &= ~mask;
    }

    public invert(mask: T) {
        this.bits ^= mask;
    }
}

export default BitField;
