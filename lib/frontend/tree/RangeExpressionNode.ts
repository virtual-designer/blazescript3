import AbstractNode from "./AbstractNode.ts";
import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class RangeExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.RangeExpression;
    public readonly from: ExpressionNode;
    public readonly to: ExpressionNode;
    public readonly fromInclusive: boolean;
    public readonly toInclusive: boolean;

    public constructor(
        from: ExpressionNode,
        to: ExpressionNode,
        fromInclusive: boolean,
        toInclusive: boolean,
        location: Location
    ) {
        super(location);
        this.from = from;
        this.to = to;
        this.fromInclusive = fromInclusive;
        this.toInclusive = toInclusive;
    }

    public override branches(): (AbstractNode | null | undefined)[] {
        return [...super.branches(), this.from, this.to];
    }
}

export default RangeExpressionNode;
