import ESTree from "estree";
import ReturnStatementNode from "../../frontend/tree/statements/ReturnStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class ReturnStatementEmitter extends ESTreeEmitter<
    ReturnStatementNode,
    ESTree.ReturnStatement
> {
    public override readonly NODE_TYPE = ReturnStatementNode;

    public override emit(
        node: ReturnStatementNode,
        context: TransformerContext
    ): EmitterResult<ESTree.ReturnStatement> {
        const argument = node.value
            ? this.transformer.transformExpression(node.value, context)
            : undefined;

        return this.combine(
            {
                type: "ReturnStatement",
                argument: argument?.node
            },
            argument
        );
    }
}

export default ReturnStatementEmitter;
