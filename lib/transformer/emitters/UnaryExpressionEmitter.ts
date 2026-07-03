import ESTree from "estree";
import { UnaryExpressionKind } from "../../frontend/tree/expressions/UnaryExpressionKind.ts";
import UnaryExpressionNode from "../../frontend/tree/expressions/UnaryExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class UnaryExpressionEmitter extends ESTreeEmitter<
    UnaryExpressionNode,
    ESTree.UnaryExpression
> {
    public override readonly NODE_TYPE = UnaryExpressionNode;

    public override emit(
        node: UnaryExpressionNode,
        context: TransformerContext
    ): ESTree.UnaryExpression {
        return {
            type: "UnaryExpression",
            argument: this.transformer.transformExpression(
                node.operand,
                context
            ) as ESTree.Expression,
            prefix: (node.kind === UnaryExpressionKind.Prefix
                ? true
                : undefined) as true,
            operator: node.operator as ESTree.UnaryExpression["operator"]
        };
    }
}

export default UnaryExpressionEmitter;
