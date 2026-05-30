import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

abstract class BaseNode {
    public abstract readonly type: NodeType;
    public readonly location: Location;

    public constructor(location: Location) {
        this.location = location;
    }
    
    public branches(): BaseNode[] {
        return [];
    }

    public traverse(callback: (node: BaseNode) => boolean) {
        if (!callback(this)) {
            return;
        }

        for (const branch of this.branches()) {
            branch.traverse(callback);
        }
    }
    
    public toString() {
        return `[${this.constructor.name} type:${this.type}]`;
    }
}

export default BaseNode;
