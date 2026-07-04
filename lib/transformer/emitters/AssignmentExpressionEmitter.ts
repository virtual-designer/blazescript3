import ESTree from "estree";
import AssignmentExpressionNode from "../../frontend/tree/expressions/AssignmentExpressionNode.ts";
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
    ): ESTree.AssignmentExpression {
        return {
            type: "AssignmentExpression",
            left: this.transformer.transformExpression(
                node.left,
                context
            ) as ESTree.Pattern,
            right: this.transformer.transformExpression(
                node.right,
                context
            ) as ESTree.Expression,
            operator: node.operator as ESTree.AssignmentOperator
        };
    }
}

export default AssignmentExpressionEmitter;
