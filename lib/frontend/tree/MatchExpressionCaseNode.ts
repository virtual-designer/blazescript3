import BaseNode from "./BaseNode.ts";
import type { ComparisonOperator } from "./BinaryOperator.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

export enum MatchExpressionCaseKind {
    Default,
    Comparison,
    Pattern
}

class MatchExpressionCaseNode extends BaseNode {
    public override readonly type = NodeType.MatchExpressionCase;
    public readonly kind: MatchExpressionCaseKind;
    public readonly comparisonOperator: ComparisonOperator | null;
    public readonly comparisonTarget: ExpressionNode | null;
    public readonly condition: ExpressionNode | null;
    public readonly body: ExpressionNode;

    public constructor(
        kind: MatchExpressionCaseKind,
        body: ExpressionNode,
        comparisonOperator: ComparisonOperator | null,
        comparisonTarget: ExpressionNode | null,
        condition: ExpressionNode | null,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.body = body;
        this.comparisonOperator = comparisonOperator;
        this.comparisonTarget = comparisonTarget;
        this.condition = condition;
    }

    public override branches(): BaseNode[] {
        return [
            ...super.branches(),
            this.body,
            this.comparisonTarget,
            this.condition
        ].filter(v => !!v);
    }
}

export default MatchExpressionCaseNode;
