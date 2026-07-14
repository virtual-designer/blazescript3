import AbstractNode from "../AbstractNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type MemberAccessExpressionNode from "../expressions/MemberAccessExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";

class AnnotationNode extends AbstractNode {
    public override readonly type = NodeType.Annotation;
    public readonly callee: IdentifierNode | MemberAccessExpressionNode;
    public readonly args: ExpressionNode[];

    public constructor(
        target: IdentifierNode | MemberAccessExpressionNode,
        args: ExpressionNode[],
        location: Location
    ) {
        super(location);
        this.callee = target;
        this.args = args;
    }
}

export default AnnotationNode;
