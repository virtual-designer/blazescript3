import AbstractNode from "../AbstractNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import StatementNode from "../StatementNode.ts";

class ExpressionStatementNode extends StatementNode {
    public override readonly type = NodeType.ExpressionStatement;
    public readonly expression: ExpressionNode;

    public constructor(expression: ExpressionNode, location: Location) {
        super(location);
        this.expression = expression;
    }

    public override branches(): (AbstractNode | null | undefined)[] {
        return [...super.branches(), this.expression];
    }
}

export default ExpressionStatementNode;
