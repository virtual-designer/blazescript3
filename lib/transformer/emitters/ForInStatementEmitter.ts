import ESTree from "estree";
import ForInStatementNode from "../../frontend/tree/statements/ForInStatementNode.ts";
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
    ): ESTree.ForOfStatement {
        return {
            type: "ForOfStatement",
            body: this.transformer.transformStatement(
                node.body,
                context
            ) as ESTree.Statement,
            await: false,
            left: this.transformer
                .getEmitter(VariableDeclarationEmitter)
                .emit(node.variable, context) as ESTree.VariableDeclaration,
            right: this.transformer.transformExpression(node.iterable, context)
        };
    }
}

export default ForInStatementEmitter;
