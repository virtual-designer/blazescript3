import ESTree from "estree";
import CallExpressionNode from "../../frontend/tree/expressions/CallExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.CallExpression> {
        const callee = this.transformer.transformExpression(
            node.callee,
            context
        );
        const args = node.args.map(arg =>
            this.transformer.transformExpression(arg, context)
        );

        return this.combine(
            {
                type: "CallExpression",
                callee: callee.node,
                arguments: args.map(arg => arg.node),
                optional: false
            },
            callee,
            ...args
        );
    }
}

export default CallExpressionEmitter;
