import ESTree from "estree";
import ForStatementNode from "../../frontend/tree/statements/ForStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class ForStatementEmitter extends ESTreeEmitter<
    ForStatementNode,
    ESTree.ForStatement
> {
    public override readonly NODE_TYPE = ForStatementNode;

    public override emit(
        node: ForStatementNode,
        context: TransformerContext
    ): ESTree.ForStatement {
        return {
            type: "ForStatement",
            init: node.init
                ? (this.transformer.transformStatement(
                      node.init,
                      context
                  ) as ESTree.VariableDeclaration)
                : undefined,
            test: node.condition
                ? this.transformer.transformExpression(node.condition, context)
                : undefined,
            update: node.mutator
                ? this.transformer.transformExpression(node.mutator, context)
                : undefined,
            body: this.transformer.transformStatement(
                node.body,
                context
            ) as ESTree.Statement
        };
    }
}

export default ForStatementEmitter;
