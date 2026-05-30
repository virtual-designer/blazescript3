import type BaseNode from "./BaseNode.ts";
import type BinaryOperator from "./BinaryOperator.ts";
import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class BinaryExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.BinaryExpression;
    public readonly operator: BinaryOperator;
    public readonly left: ExpressionNode;
    public readonly right: ExpressionNode;

    public constructor(
        operator: BinaryOperator,
        left: ExpressionNode,
        right: ExpressionNode,
        location: Location
    ) {
        super(location);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    public override branches(): BaseNode[] {
        return [...super.branches(), this.left, this.right];
    }
}

export default BinaryExpressionNode;
