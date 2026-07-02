import ExpressionNode from "../ExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";

class AwaitExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.AwaitExpression;
    public readonly operand: ExpressionNode;

    public constructor(operand: ExpressionNode, location: Location) {
        super(location);
        this.operand = operand;
    }

    public override branches() {
        return [...super.branches(), this.operand];
    }
}

export default AwaitExpressionNode;
