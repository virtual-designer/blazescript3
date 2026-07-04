import ESTree from "estree";
import CallExpressionNode from "../../frontend/tree/expressions/CallExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class CallExpressionEmitter extends ESTreeEmitter<
    CallExpressionNode,
    ESTree.CallExpression
> {
    public override readonly NODE_TYPE = CallExpressionNode;

    public override emit(
        node: CallExpressionNode,
        context: TransformerContext
    ): ESTree.CallExpression {
        return {
            type: "CallExpression",
            callee: this.transformer.transformExpression(node.callee, context),
            arguments: node.args.map(arg =>
                this.transformer.transformExpression(arg, context)
            ),
            optional: false
        };
    }
}

export default CallExpressionEmitter;
