import BaseNode from "./BaseNode.ts";
import type { Location } from "./Location.ts";

abstract class BaseNodeWithChildren extends BaseNode {
    public readonly children: BaseNode[] = [];

    public constructor(children: BaseNode[], location: Location) {
        super(location);
        this.children = children;
    }

    public override branches() {
        return [...super.branches(), ...this.children];
    }

    public appendChild(child: BaseNode): this {
        this.children.push(child);
        return this;
    }
}

export default BaseNodeWithChildren;
