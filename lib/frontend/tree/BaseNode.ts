import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

abstract class BaseNode {
    public abstract readonly type: NodeType;
    public readonly location: Location;

    public constructor(location: Location) {
        this.location = location;
    }
    
    public toString() {
        return `[${this.constructor.name} type:${this.type}]`;
    }
}

export default BaseNode;
