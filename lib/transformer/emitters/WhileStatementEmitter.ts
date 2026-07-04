import ESTree from "estree";
import WhileStatementNode from "../../frontend/tree/statements/WhileStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class WhileStatementEmitter extends ESTreeEmitter<
    WhileStatementNode,
    ESTree.WhileStatement
> {
    public override readonly NODE_TYPE = WhileStatementNode;

    public override emit(
        node: WhileStatementNode,
        context: TransformerContext
    ): ESTree.WhileStatement {
        return {
            type: "WhileStatement",
            test: this.transformer.transformExpression(node.condition, context),
            body: this.transformer.transformStatement(
                node.body,
                context
            ) as ESTree.Statement
        };
    }
}

export default WhileStatementEmitter;
