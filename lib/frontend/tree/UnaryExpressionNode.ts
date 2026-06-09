import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type { UnaryExpressionKind } from "./UnaryExpressionKind.ts";
import type UnaryOperator from "./UnaryOperator.ts";

class UnaryExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.UnaryExpression;
    public readonly operator: UnaryOperator;
    public readonly operand: ExpressionNode;
    public readonly kind: UnaryExpressionKind;

    public constructor(
        operator: UnaryOperator,
        operand: ExpressionNode,
        kind: UnaryExpressionKind,
        location: Location
    ) {
        super(location);
        this.operator = operator;
        this.operand = operand;
        this.kind = kind;
    }
    
    public override branches() {
        return [...super.branches(), this.operand];
    }
}

export default UnaryExpressionNode;
