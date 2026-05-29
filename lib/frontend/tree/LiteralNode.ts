import ExpressionNode from "./ExpressionNode.ts";
import type LiteralNodeKind from "./LiteralNodeKind.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class LiteralNode extends ExpressionNode {
    public override readonly type = NodeType.Literal;
    public readonly kind: LiteralNodeKind;
    public readonly value: string;

    public constructor(kind: LiteralNodeKind, value: string, location: Location) {
        super(location);
        this.kind = kind;
        this.value = value;
    }
}

export default LiteralNode;