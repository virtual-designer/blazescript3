import ESTree from "estree";
import MemberAccessExpressionNode from "../../frontend/tree/expressions/MemberAccessExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class MemberAccessExpressionEmitter extends ESTreeEmitter<
    MemberAccessExpressionNode,
    ESTree.MemberExpression
> {
    public override readonly NODE_TYPE = MemberAccessExpressionNode;

    public override emit(
        node: MemberAccessExpressionNode,
        context: TransformerContext
    ): ESTree.MemberExpression {
        return {
            type: "MemberExpression",
            computed: false,
            object: this.transformer.transformExpression(node.target, context),
            property: this.transformer.transformExpression(
                node.member,
                context
            ),
            optional: node.optional
        };
    }
}

export default MemberAccessExpressionEmitter;
