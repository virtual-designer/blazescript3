import type { AssignmentOperator } from "estree";
import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class AssignmentExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.AssignmentExpression;
    public readonly operator: AssignmentOperator;
    public readonly left: ExpressionNode;
    public readonly right: ExpressionNode;

    public constructor(
        operator: AssignmentOperator,
        left: ExpressionNode,
        right: ExpressionNode,
        location: Location
    ) {
        super(location);
        this.left = left;
        this.right = right;
        this.operator = operator;
    }

    public override branches() {
        return [...super.branches(), this.left, this.right];
    }
}

export default AssignmentExpressionNode;
