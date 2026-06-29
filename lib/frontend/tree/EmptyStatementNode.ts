import NodeType from "./NodeType.ts";
import StatementNode from "./StatementNode.ts";

class EmptyStatementNode extends StatementNode {
    public override readonly type = NodeType.EmptyStatement;
}

export default EmptyStatementNode;
