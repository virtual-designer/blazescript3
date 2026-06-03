import ExpressionNode from "./ExpressionNode.ts";
import LiteralNodeKind from "./LiteralNodeKind.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";

class LiteralNode extends ExpressionNode {
    public override readonly type = NodeType.Literal;
    public readonly kind: LiteralNodeKind;
    public readonly value: string;

    public constructor(
        kind: LiteralNodeKind,
        value: string,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.value = value;
    }

    public getJSValue() {
        switch (this.kind) {
            case LiteralNodeKind.Boolean:
                return this.value !== "false";

            case LiteralNodeKind.Integer:
                return Number.parseInt(this.value, 10);

            case LiteralNodeKind.Float:
                return Number.parseFloat(this.value);

            case LiteralNodeKind.Null:
                return null;

            case LiteralNodeKind.String:
                return this.value;

            default:
                throw new Error("Unknown literal kind");
        }
    }
}

export default LiteralNode;
