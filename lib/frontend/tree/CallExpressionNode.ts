import type BaseNode from "./BaseNode.ts";
import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class CallExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.Call;
    public readonly callee: ExpressionNode;
    public readonly args: ExpressionNode[];

    public constructor(
        callee: ExpressionNode,
        args: ExpressionNode[],
        location: Location
    ) {
        super(location);
        this.callee = callee;
        this.args = args;
    }

    public override branches(): BaseNode[] {
        return [...super.branches(), this.callee, ...this.args];
    }
}

export default CallExpressionNode;
