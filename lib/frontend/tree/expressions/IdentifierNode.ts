import ExpressionNode from "../ExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";

class IdentifierNode extends ExpressionNode {
    public override readonly type = NodeType.Identifier;
    public readonly symbol: string;

    public constructor(symbol: string, location: Location) {
        super(location);
        this.symbol = symbol;
    }
}

export default IdentifierNode;
