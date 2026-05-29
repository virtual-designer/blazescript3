import type { Location } from "../tree/Location.ts";
import type TokenType from "./TokenType.ts";

class Token {
    public readonly type: TokenType;
    public readonly value: string;
    public readonly location: Location;

    public constructor(type: TokenType, value: string, location: Location) {
        this.type = type;
        this.value = value;
        this.location = location;
    }
}

export default Token;
