import NodeType from "./NodeType.ts";
import StatementNodeWithChildren from "./StatementNodeWithChildren.ts";

class RootNode extends StatementNodeWithChildren {
    public override readonly type = NodeType.Root;
}

export default RootNode;
