import NodeType from "./NodeType.ts";
import BaseNodeWithChildren from "./BaseNodeWithChildren.ts";

class RootNode extends BaseNodeWithChildren {
    public override readonly type = NodeType.Root;
}

export default RootNode;
