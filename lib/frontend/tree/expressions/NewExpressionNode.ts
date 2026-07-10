import ExpressionNode from "../ExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";

class NewExpressionNode extends ExpressionNode {
    public override readonly type = NodeType.NewExpression;
    public readonly constructorExpression: ExpressionNode;
    public readonly args: ExpressionNode[];

    public constructor(
        constructorExpression: ExpressionNode,
        args: ExpressionNode[],
        location: Location
    ) {
        super(location);
        this.constructorExpression = constructorExpression;
        this.args = args;
    }

    public override branches() {
        return [...super.branches(), this.constructorExpression, ...this.args];
    }
}

export default NewExpressionNode;
