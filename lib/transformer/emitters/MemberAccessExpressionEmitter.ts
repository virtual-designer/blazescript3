import ESTree from "estree";
import MemberAccessExpressionNode from "../../frontend/tree/expressions/MemberAccessExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.MemberExpression> {
        const target = this.transformer.transformExpression(
            node.target,
            context
        );
        const property = this.transformer.transformExpression(
            node.member,
            context
        );

        return this.combine(
            {
                type: "MemberExpression",
                computed: false,
                object: target.node,
                property: property.node,
                optional: node.optional
            },
            target,
            property
        );
    }
}

export default MemberAccessExpressionEmitter;
