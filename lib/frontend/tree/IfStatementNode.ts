import BaseNode from "./BaseNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class IfStatementNode extends BaseNode {
    public override readonly type = NodeType.IfStatement;
    public readonly condition: ExpressionNode;
    public readonly thenBlock: BaseNode;
    public readonly elseBlock: BaseNode | null;

    public constructor(
        condition: ExpressionNode,
        thenBlock: BaseNode,
        elseBlock: BaseNode | null = null,
        location: Location
    ) {
        super(location);
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
    }

    public override branches() {
        return [...super.branches(), this.condition, this.thenBlock, this.elseBlock];
    }
}

export default IfStatementNode;
