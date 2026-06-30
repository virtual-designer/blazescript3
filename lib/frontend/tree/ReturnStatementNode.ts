import ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import StatementNode from "./StatementNode.ts";

class ReturnStatementNode extends StatementNode {
    public override readonly type = NodeType.ReturnStatement;
    public readonly value: ExpressionNode | null;

    public constructor(value: ExpressionNode | null, location: Location) {
        super(location);
        this.value = value;
    }

    public override branches() {
        return [...super.branches(), this.value];
    }
}

export default ReturnStatementNode;
