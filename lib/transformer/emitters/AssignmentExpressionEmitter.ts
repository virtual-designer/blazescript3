import ESTree from "estree";
import AssignmentExpressionNode from "../../frontend/tree/expressions/AssignmentExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class AssignmentExpressionEmitter extends ESTreeEmitter<
    AssignmentExpressionNode,
    ESTree.AssignmentExpression
> {
    public override readonly NODE_TYPE = AssignmentExpressionNode;

    public override emit(
        node: AssignmentExpressionNode,
        context: TransformerContext
    ): EmitterResult<ESTree.AssignmentExpression> {
        const left = this.transformer.transformExpression(node.left, context);
        const right = this.transformer.transformExpression(node.right, context);

        return this.combine(
            {
                type: "AssignmentExpression",
                left: left.node as ESTree.Pattern,
                right: right.node as ESTree.Expression,
                operator: node.operator as ESTree.AssignmentOperator
            },
            left,
            right
        );
    }
}

export default AssignmentExpressionEmitter;
