import BaseNode from "./BaseNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class WhileStatementNode extends BaseNode {
    public override readonly type = NodeType.WhileStatement;
    public readonly condition: ExpressionNode;
    public readonly body: BaseNode;

    public constructor(
        condition: ExpressionNode,
        body: BaseNode,
        location: Location
    ) {
        super(location);
        this.condition = condition;
        this.body = body;
    }

    public override branches(): (BaseNode | null | undefined)[] {
        return [
            ...super.branches(),
            this.condition,
            this.body
        ];
    }
}

export default WhileStatementNode;
