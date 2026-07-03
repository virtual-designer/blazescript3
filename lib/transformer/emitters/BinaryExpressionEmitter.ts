import ESTree from "estree";
import BinaryExpressionNode from "../../frontend/tree/expressions/BinaryExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class BinaryExpressionEmitter extends ESTreeEmitter<
    BinaryExpressionNode,
    ESTree.BinaryExpression
> {
    public override readonly NODE_TYPE = BinaryExpressionNode;

    public override emit(
        node: BinaryExpressionNode,
        context: TransformerContext
    ): ESTree.BinaryExpression {
        return this.transformer.transformJSBinaryOperation(
            node.operator,
            this.transformer.transformExpression(node.left, context),
            this.transformer.transformExpression(node.right, context)
        );
    }
}

export default BinaryExpressionEmitter;
