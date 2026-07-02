import NodeType from "../NodeType.ts";
import StatementNodeWithChildren from "../StatementNodeWithChildren.ts";

class BlockStatementNode extends StatementNodeWithChildren {
    public override readonly type = NodeType.BlockStatement;
}

export default BlockStatementNode;
