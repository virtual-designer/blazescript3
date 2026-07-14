import ESTree from "estree";
import ForStatementNode from "../../frontend/tree/statements/ForStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.ForStatement> {
        const init = node.init
            ? this.transformer.transformStatement(node.init, context)
            : undefined;
        const test = node.condition
            ? this.transformer.transformExpression(node.condition, context)
            : undefined;
        const update = node.mutator
            ? this.transformer.transformExpression(node.mutator, context)
            : undefined;
        const body = this.transformer.transformStatement(node.body, context);

        return this.combine(
            {
                type: "ForStatement",
                init: init?.node as ESTree.VariableDeclaration,
                test: test?.node,
                update: update?.node,
                body: body.node
            },
            init,
            test,
            update,
            body
        );
    }
}

export default ForStatementEmitter;
