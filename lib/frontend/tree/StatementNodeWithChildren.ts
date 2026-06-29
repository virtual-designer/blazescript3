import AbstractNode from "./AbstractNode.ts";
import type { Location } from "./Location.ts";
import StatementNode from "./StatementNode.ts";

abstract class StatementNodeWithChildren extends StatementNode {
    public readonly children: AbstractNode[] = [];

    public constructor(children: AbstractNode[], location: Location) {
        super(location);
        this.children = children;
    }

    public override branches() {
        return [...super.branches(), ...this.children];
    }

    public appendChild(child: AbstractNode): this {
        this.children.push(child);
        return this;
    }
}

export default StatementNodeWithChildren;
