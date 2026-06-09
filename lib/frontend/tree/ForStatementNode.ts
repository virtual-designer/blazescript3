import BaseNode from "./BaseNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class ForStatementNode extends BaseNode {
    public override readonly type = NodeType.ForStatement;
    public readonly init: BaseNode | null;
    public readonly condition: ExpressionNode | null;
    public readonly mutator: ExpressionNode | null;
    public readonly body: BaseNode;

    public constructor(
        init: BaseNode | null,
        condition: ExpressionNode | null,
        mutator: ExpressionNode | null,
        body: BaseNode,
        location: Location
    ) {
        super(location);
        this.init = init;
        this.condition = condition;
        this.mutator = mutator;
        this.body = body;
    }

    public override branches(): (BaseNode | null | undefined)[] {
        return [
            ...super.branches(),
            this.init,
            this.condition,
            this.mutator,
            this.body
        ];
    }
}

export default ForStatementNode;
