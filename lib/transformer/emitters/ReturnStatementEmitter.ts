import ESTree from "estree";
import ReturnStatementNode from "../../frontend/tree/statements/ReturnStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class ReturnStatementEmitter extends ESTreeEmitter<
    ReturnStatementNode,
    ESTree.ReturnStatement
> {
    public override readonly NODE_TYPE = ReturnStatementNode;

    public override emit(
        node: ReturnStatementNode,
        context: TransformerContext
    ): ESTree.ReturnStatement {
        return {
            type: "ReturnStatement",
            argument: node.value
                ? this.transformer.transformExpression(node.value, context)
                : undefined
        };
    }
}

export default ReturnStatementEmitter;
