import BinaryExpressionNode from "./BinaryExpressionNode.ts";
import type { AssignmentOperator } from "./BinaryOperator.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";

class AssignmentExpressionNode extends BinaryExpressionNode {
    public override readonly operator: AssignmentOperator;

    public constructor(
        operator: AssignmentOperator,
        left: ExpressionNode,
        right: ExpressionNode,
        location: Location
    ) {
        super(operator, left, right, location);
        this.operator = operator;
    }
}

export default AssignmentExpressionNode;
