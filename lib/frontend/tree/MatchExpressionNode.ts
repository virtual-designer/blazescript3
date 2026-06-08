import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import type MatchExpressionCaseNode from "./MatchExpressionCaseNode.ts";
import NodeType from "./NodeType.ts";

class MatchExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.MatchExpression;
    public readonly subject: ExpressionNode;
    public readonly cases: readonly MatchExpressionCaseNode[];

    public constructor(
        subject: ExpressionNode,
        cases: MatchExpressionCaseNode[],
        location: Location
    ) {
        super(location);
        this.subject = subject;
        this.cases = cases;
    }

    public override branches() {
        return [...super.branches(), this.subject, ...this.cases];
    }
}

export default MatchExpressionNode;
