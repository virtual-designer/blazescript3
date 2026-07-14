import ESTree from "estree";
import BinaryExpressionNode from "../../frontend/tree/expressions/BinaryExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class BinaryExpressionEmitter extends ESTreeEmitter<
    BinaryExpressionNode,
    ESTree.BinaryExpression
> {
    public override readonly NODE_TYPE = BinaryExpressionNode;

    public override emit(
        node: BinaryExpressionNode,
        context: TransformerContext
    ): EmitterResult<ESTree.BinaryExpression> {
        const left = this.transformer.transformExpression(node.left, context);
        const right = this.transformer.transformExpression(node.right, context);

        return this.combine(
            this.transformer.transformJSBinaryOperation(
                node.operator,
                left.node,
                right.node
            ),
            left,
            right
        );
    }
}

export default BinaryExpressionEmitter;
