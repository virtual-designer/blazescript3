import ESTree from "estree";
import NewExpressionNode from "../../frontend/tree/expressions/NewExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class NewExpressionEmitter extends ESTreeEmitter<
    NewExpressionNode,
    ESTree.NewExpression
> {
    public override readonly NODE_TYPE = NewExpressionNode;

    public override emit(
        node: NewExpressionNode,
        context: TransformerContext
    ): EmitterResult<ESTree.NewExpression> {
        const callee = this.transformer.transformExpression(
            node.constructorExpression,
            context
        );

        const args = node.args.map(arg =>
            this.transformer.transformExpression(arg, context)
        );

        return this.combine(
            {
                type: "NewExpression",
                callee: callee.node,
                arguments: args.map(({ node }) => node)
            },
            callee,
            ...args
        );
    }
}

export default NewExpressionEmitter;
