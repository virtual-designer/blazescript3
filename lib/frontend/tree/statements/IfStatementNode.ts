import AbstractNode from "../AbstractNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import StatementNode from "../StatementNode.ts";

class IfStatementNode extends StatementNode {
    public override readonly type = NodeType.IfStatement;
    public readonly condition: ExpressionNode;
    public readonly thenBlock: AbstractNode;
    public readonly elseBlock: AbstractNode | null;

    public constructor(
        condition: ExpressionNode,
        thenBlock: AbstractNode,
        elseBlock: AbstractNode | null = null,
        location: Location
    ) {
        super(location);
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.condition,
            this.thenBlock,
            this.elseBlock
        ];
    }
}

export default IfStatementNode;
