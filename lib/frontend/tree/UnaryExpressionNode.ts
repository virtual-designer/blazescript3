import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type UnaryOperator from "./UnaryOperator.ts";

class UnaryExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.UnaryExpression;
    public readonly operator: UnaryOperator;
    public readonly operand: ExpressionNode;

    public constructor(
        operator: UnaryOperator,
        operand: ExpressionNode,
        location: Location
    ) {
        super(location);
        this.operator = operator;
        this.operand = operand;
    }
}

export default UnaryExpressionNode;
