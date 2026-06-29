import AbstractNode from "./AbstractNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import StatementNode from "./StatementNode.ts";
import type VariableDeclarationNode from "./VariableDeclarationNode.ts";

class ForInStatementNode extends StatementNode {
    public override readonly type = NodeType.ForInStatement;
    public readonly variable: VariableDeclarationNode;
    public readonly iterable: ExpressionNode;
    public readonly body: AbstractNode;

    public constructor(
        variable: VariableDeclarationNode,
        iterable: ExpressionNode,
        body: AbstractNode,
        location: Location
    ) {
        super(location);
        this.variable = variable;
        this.iterable = iterable;
        this.body = body;
    }

    public override branches(): (AbstractNode | null | undefined)[] {
        return [...super.branches(), this.variable, this.iterable, this.body];
    }
}

export default ForInStatementNode;
