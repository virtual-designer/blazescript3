import AbstractNode from "../tree/AbstractNode.ts";
import type { Location } from "../tree/Location.ts";

class ParserError extends Error {
    public readonly node?: AbstractNode;
    public readonly location: Location;

    public constructor(message: string, nodeOrLocation: AbstractNode | Location) {
        super(message);
        
        if (nodeOrLocation instanceof AbstractNode) {
            this.node = nodeOrLocation;
            this.location = nodeOrLocation.location;
        }
        else {
            this.location = nodeOrLocation;
        }
    }
}

export default ParserError;