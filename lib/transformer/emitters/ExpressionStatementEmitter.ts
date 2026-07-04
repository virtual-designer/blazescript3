import ESTree from "estree";
import ExpressionStatementNode from "../../frontend/tree/statements/ExpressionStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class ExpressionStatementEmitter extends ESTreeEmitter<
    ExpressionStatementNode,
    ESTree.ExpressionStatement
> {
    public override readonly NODE_TYPE = ExpressionStatementNode;

    public override emit(
        node: ExpressionStatementNode,
        context: TransformerContext
    ): ESTree.ExpressionStatement {
        return {
            type: "ExpressionStatement",
            expression: this.transformer.transformExpression(
                node.expression,
                context
            )
        };
    }
}

export default ExpressionStatementEmitter;
