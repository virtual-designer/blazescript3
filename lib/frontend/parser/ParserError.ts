import BaseNode from "../tree/BaseNode.ts";
import type { Location } from "../tree/Location.ts";

class ParserError extends Error {
    public readonly node?: BaseNode;
    public readonly location: Location;

    public constructor(message: string, nodeOrLocation: BaseNode | Location) {
        super(message);
        
        if (nodeOrLocation instanceof BaseNode) {
            this.node = nodeOrLocation;
            this.location = nodeOrLocation.location;
        }
        else {
            this.location = nodeOrLocation;
        }
    }
}

export default ParserError;