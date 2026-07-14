import ESTree from "estree";
import ExpressionStatementNode from "../../frontend/tree/statements/ExpressionStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.ExpressionStatement> {
        const expression = this.transformer.transformExpression(
            node.expression,
            context
        );

        return this.combine(
            {
                type: "ExpressionStatement",
                expression: expression.node
            },
            expression
        );
    }
}

export default ExpressionStatementEmitter;
