import ESTree from "estree";
import { UnaryExpressionKind } from "../../frontend/tree/expressions/UnaryExpressionKind.ts";
import UnaryExpressionNode from "../../frontend/tree/expressions/UnaryExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class UnaryExpressionEmitter extends ESTreeEmitter<
    UnaryExpressionNode,
    ESTree.UnaryExpression
> {
    public override readonly NODE_TYPE = UnaryExpressionNode;

    public override emit(
        node: UnaryExpressionNode,
        context: TransformerContext
    ): EmitterResult<ESTree.UnaryExpression> {
        const expression = this.transformer.transformExpression(
            node.operand,
            context
        );

        return this.combine(
            {
                type: "UnaryExpression",
                argument: expression.node,
                prefix: (node.kind === UnaryExpressionKind.Prefix
                    ? true
                    : undefined) as true,
                operator: node.operator as ESTree.UnaryExpression["operator"]
            },
            expression
        );
    }
}

export default UnaryExpressionEmitter;
