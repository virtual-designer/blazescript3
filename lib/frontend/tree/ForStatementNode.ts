import AbstractNode from "./AbstractNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import StatementNode from "./StatementNode.ts";

class ForStatementNode extends StatementNode {
    public override readonly type = NodeType.ForStatement;
    public readonly init: AbstractNode | null;
    public readonly condition: ExpressionNode | null;
    public readonly mutator: ExpressionNode | null;
    public readonly body: AbstractNode;

    public constructor(
        init: AbstractNode | null,
        condition: ExpressionNode | null,
        mutator: ExpressionNode | null,
        body: AbstractNode,
        location: Location
    ) {
        super(location);
        this.init = init;
        this.condition = condition;
        this.mutator = mutator;
        this.body = body;
    }

    public override branches(): (AbstractNode | null | undefined)[] {
        return [
            ...super.branches(),
            this.init,
            this.condition,
            this.mutator,
            this.body
        ];
    }
}

export default ForStatementNode;
