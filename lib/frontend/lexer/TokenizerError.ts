import type { Location } from "../tree/Location.ts";

class TokenizerError extends Error {
    public readonly location: Location;

    public constructor(message: string, location: Location) {
        super(message);
        this.location = location;
    }
}

export default TokenizerError;
