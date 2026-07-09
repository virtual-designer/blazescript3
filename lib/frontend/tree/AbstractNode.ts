import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type { TreeWalker } from "./TreeWalker.ts";

abstract class AbstractNode {
    public abstract readonly type: NodeType;
    public readonly location: Location;

    public constructor(location: Location) {
        this.location = location;
    }

    public branches(): (AbstractNode | null | undefined)[] {
        return [];
    }

    public filteredBranches(): AbstractNode[] {
        return this.branches().filter(b => !!b);
    }

    public traverse(callback: (node: AbstractNode) => boolean) {
        if (!callback(this)) {
            return;
        }

        for (const branch of this.filteredBranches()) {
            branch.traverse(callback);
        }
    }

    public walk(walker: Readonly<TreeWalker<this>>): void {
        let result = walker._init?.(this);
        walker = { ...walker, ...result } as TreeWalker<this>;

        const callback = walker[this.type];

        if (callback) {
            result = callback.call(walker, this as never);
            walker = { ...walker, ...result } as TreeWalker<this>;
        }

        for (const branch of this.filteredBranches()) {
            branch.walk({
                ...walker,
                _cleanup: undefined,
                _init: undefined
            });
        }

        walker._cleanup?.(this);
    }

    public toString() {
        return `[${this.constructor.name} type:${this.type}]`;
    }
}

export default AbstractNode;
