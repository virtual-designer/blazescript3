import ESTree from "estree";
import ForInStatementNode from "../../frontend/tree/statements/ForInStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import VariableDeclarationEmitter from "./VariableDeclarationEmitter.ts";

class ForInStatementEmitter extends ESTreeEmitter<
    ForInStatementNode,
    ESTree.ForOfStatement
> {
    public override readonly NODE_TYPE = ForInStatementNode;

    public override emit(
        node: ForInStatementNode,
        context: TransformerContext
    ): EmitterResult<ESTree.ForOfStatement> {
        const statement = this.transformer.transformStatement(
            node.body,
            context
        );

        const variableDeclaration = this.transformer
            .getEmitter(VariableDeclarationEmitter)
            .emit(node.variable, context);

        const right = this.transformer.transformExpression(
            node.iterable,
            context
        );

        return this.combine(
            {
                type: "ForOfStatement",
                body: statement.node,
                await: false,
                left: variableDeclaration.node,
                right: right.node
            },
            variableDeclaration,
            right,
            statement
        );
    }
}

export default ForInStatementEmitter;
