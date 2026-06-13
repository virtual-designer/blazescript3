import BaseNode from "./BaseNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type VariableDeclarationNode from "./VariableDeclarationNode.ts";

class ForInStatementNode extends BaseNode {
    public override readonly type = NodeType.ForInStatement;
    public readonly variable: VariableDeclarationNode;
    public readonly iterable: ExpressionNode;
    public readonly body: BaseNode;

    public constructor(
        variable: VariableDeclarationNode,
        iterable: ExpressionNode,
        body: BaseNode,
        location: Location
    ) {
        super(location);
        this.variable = variable;
        this.iterable = iterable;
        this.body = body;
    }

    public override branches(): (BaseNode | null | undefined)[] {
        return [...super.branches(), this.variable, this.iterable, this.body];
    }
}

export default ForInStatementNode;
