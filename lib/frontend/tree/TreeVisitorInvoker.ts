import type AbstractNode from "./AbstractNode.ts";
import NodeType from "./NodeType.ts";
import type { TreeVisitor } from "./TreeVisitor.ts";

export class TreeVisitorInvoker {
    public readonly node: AbstractNode;

    public constructor(node: AbstractNode) {
        this.node = node;
    }

    private invokeOnNode<C extends object | undefined>(
        node: AbstractNode,
        context: C,
        visitor: TreeVisitor<C>
    ): void {
        const result = visitor[
            `visit${NodeType[node.type] as keyof typeof NodeType}`
        ]?.call(visitor, node as never, context);

        for (const branch of node.branches()) {
            if (branch) {
                this.invokeOnNode(branch, context, visitor);
            }
        }

        result?.cleanup?.();
    }

    public invoke<C extends object | undefined>(
        visitor: TreeVisitor<C>,
        context: C
    ): void {
        return this.invokeOnNode(this.node, context, visitor);
    }
}
