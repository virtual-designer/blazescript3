import BaseNodeWithChildren from "./BaseNodeWithChildren.ts";
import NodeType from "./NodeType.ts";

class BlockStatementNode extends BaseNodeWithChildren {
    public override readonly type = NodeType.BlockStatement;
}

export default BlockStatementNode;