import ESTree from "estree";
import NewExpressionNode from "../../frontend/tree/expressions/NewExpressionNode.ts";
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
    ): ESTree.NewExpression {
        return {
            type: "NewExpression",
            callee: this.transformer.transformExpression(
                node.constructorExpression,
                context
            ),
            arguments: node.args.map(arg =>
                this.transformer.transformExpression(arg, context)
            )
        };
    }
}

export default NewExpressionEmitter;
