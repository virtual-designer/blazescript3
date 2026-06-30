import type { Diagnostic } from "../../diagnostic/Diagnostic.ts";
import AbstractNode from "../tree/AbstractNode.ts";
import type { Location } from "../tree/Location.ts";

class ParserError extends Error {
    public readonly node?: AbstractNode;
    public readonly location: Location;
    public readonly diagnostic?: Diagnostic;

    public constructor(
        message: string,
        nodeOrLocation: AbstractNode | Location,
        diagnostic?: Diagnostic
    ) {
        super(message);

        if (nodeOrLocation instanceof AbstractNode) {
            this.node = nodeOrLocation;
            this.location = nodeOrLocation.location;
        } else {
            this.location = nodeOrLocation;
        }

        this.diagnostic = diagnostic;
    }
}

export default ParserError;
