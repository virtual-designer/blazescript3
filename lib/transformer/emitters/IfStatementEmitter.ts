import ESTree from "estree";
import IfStatementNode from "../../frontend/tree/statements/IfStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class IfStatementEmitter extends ESTreeEmitter<
    IfStatementNode,
    ESTree.IfStatement
> {
    public override readonly NODE_TYPE = IfStatementNode;

    public override emit(
        node: IfStatementNode,
        context: TransformerContext
    ): ESTree.IfStatement {
        return {
            type: "IfStatement",
            test: this.transformer.transformExpression(node.condition, context),
            consequent: this.transformer.transformStatement(
                node.thenBlock,
                context
            ) as ESTree.Statement,
            alternate: node.elseBlock
                ? (this.transformer.transformStatement(
                      node.elseBlock,
                      context
                  ) as ESTree.Statement)
                : undefined
        };
    }
}

export default IfStatementEmitter;
