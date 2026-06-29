import AbstractNode from "./AbstractNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import StatementNode from "./StatementNode.ts";

class WhileStatementNode extends StatementNode {
    public override readonly type = NodeType.WhileStatement;
    public readonly condition: ExpressionNode;
    public readonly body: AbstractNode;

    public constructor(
        condition: ExpressionNode,
        body: AbstractNode,
        location: Location
    ) {
        super(location);
        this.condition = condition;
        this.body = body;
    }

    public override branches(): (AbstractNode | null | undefined)[] {
        return [...super.branches(), this.condition, this.body];
    }
}

export default WhileStatementNode;
