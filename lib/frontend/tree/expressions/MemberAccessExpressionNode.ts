import ExpressionNode from "../ExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type IdentifierNode from "./IdentifierNode.ts";

class MemberAccessExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.MemberAccessExpression;
    public readonly target: ExpressionNode;
    public readonly member: IdentifierNode;
    public readonly optional: boolean;

    public constructor(
        target: ExpressionNode,
        member: IdentifierNode,
        optional: boolean,
        location: Location
    ) {
        super(location);
        this.target = target;
        this.member = member;
        this.optional = optional;
    }

    public override branches() {
        return [...super.branches(), this.target, this.member];
    }
}

export default MemberAccessExpressionNode;
