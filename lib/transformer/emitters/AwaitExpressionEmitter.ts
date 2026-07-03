import ESTree from "estree";
import AwaitExpressionNode from "../../frontend/tree/expressions/AwaitExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class AwaitExpressionEmitter extends ESTreeEmitter<
    AwaitExpressionNode,
    ESTree.AwaitExpression
> {
    public override readonly NODE_TYPE = AwaitExpressionNode;

    public override emit(
        node: AwaitExpressionNode,
        context: TransformerContext
    ): ESTree.AwaitExpression {
        return {
            type: "AwaitExpression",
            argument: this.transformer.transformExpression(
                node.operand,
                context
            )
        };
    }
}

export default AwaitExpressionEmitter;
