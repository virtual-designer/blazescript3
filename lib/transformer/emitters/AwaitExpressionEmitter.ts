import ESTree from "estree";
import AwaitExpressionNode from "../../frontend/tree/expressions/AwaitExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class AwaitExpressionEmitter extends ESTreeEmitter<
    AwaitExpressionNode,
    ESTree.AwaitExpression
> {
    public override readonly NODE_TYPE = AwaitExpressionNode;

    public override emit(
        node: AwaitExpressionNode,
        context: TransformerContext
    ): EmitterResult<ESTree.AwaitExpression> {
        const argument = this.transformer.transformExpression(
            node.operand,
            context
        );

        return this.combine(
            {
                type: "AwaitExpression",
                argument: argument.node
            },
            argument
        );
    }
}

export default AwaitExpressionEmitter;
