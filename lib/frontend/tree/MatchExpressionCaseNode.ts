import BaseNode from "./BaseNode.ts";
import type { ComparsionOperator } from "./BinaryOperator.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

export enum MatchExpressionCaseKind {
    Default,
    Comparsion,
    Pattern
}

class MatchExpressionCaseNode extends BaseNode {
    public override readonly type = NodeType.MatchExpressionCase;
    public readonly kind: MatchExpressionCaseKind;
    public readonly comparisonOperator: ComparsionOperator | null;
    public readonly comparsionTarget: ExpressionNode | null;
    public readonly condition: ExpressionNode | null;
    public readonly body: ExpressionNode;

    public constructor(
        kind: MatchExpressionCaseKind,
        body: ExpressionNode,
        comparisonOperator: ComparsionOperator | null,
        comparsionTarget: ExpressionNode | null,
        condition: ExpressionNode | null,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.body = body;
        this.comparisonOperator = comparisonOperator;
        this.comparsionTarget = comparsionTarget;
        this.condition = condition;
    }

    public override branches(): BaseNode[] {
        return [
            ...super.branches(),
            this.body,
            this.comparsionTarget,
            this.condition
        ].filter(v => !!v);
    }
}

export default MatchExpressionCaseNode;
