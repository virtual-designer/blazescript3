import BaseNode from "./BaseNode.ts";
import NodeType from "./NodeType.ts";

class EmptyStatementNode extends BaseNode {
    public override readonly type = NodeType.EmptyStatement;
}

export default EmptyStatementNode;
