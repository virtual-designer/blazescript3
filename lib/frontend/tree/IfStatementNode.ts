import BaseNode from "./BaseNode.ts";
import type BlockStatementNode from "./BlockStatementNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class IfStatementNode extends BaseNode {
    public override readonly type = NodeType.IfStatement;
    public readonly condition: ExpressionNode;
    public readonly thenBlock: ExpressionNode | BlockStatementNode;
    public readonly elseBlock: ExpressionNode | BlockStatementNode | null;

    public constructor(
        condition: ExpressionNode,
        thenBlock: ExpressionNode | BlockStatementNode,
        elseBlock: ExpressionNode | BlockStatementNode | null = null,
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
