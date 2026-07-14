import ESTree from "estree";
import WhileStatementNode from "../../frontend/tree/statements/WhileStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.WhileStatement> {
        const test = this.transformer.transformExpression(
            node.condition,
            context
        );
        const body = this.transformer.transformStatement(node.body, context);

        return this.combine(
            {
                type: "WhileStatement",
                test: test.node,
                body: body.node
            },
            test,
            body
        );
    }
}

export default WhileStatementEmitter;
