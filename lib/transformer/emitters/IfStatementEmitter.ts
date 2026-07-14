import ESTree from "estree";
import IfStatementNode from "../../frontend/tree/statements/IfStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class IfStatementEmitter extends ESTreeEmitter<
    IfStatementNode,
    ESTree.IfStatement
> {
    public override readonly NODE_TYPE = IfStatementNode;

    public override emit(
        node: IfStatementNode,
        context: TransformerContext
    ): EmitterResult<ESTree.IfStatement> {
        const condition = this.transformer.transformExpression(
            node.condition,
            context
        );

        const thenBlock = this.transformer.transformStatement(
            node.thenBlock,
            context
        );

        const elseBlock = node.elseBlock
            ? this.transformer.transformStatement(node.elseBlock, context)
            : undefined;

        return this.combine(
            {
                type: "IfStatement",
                test: condition.node,
                consequent: thenBlock.node,
                alternate: elseBlock?.node
            },
            condition,
            thenBlock,
            elseBlock
        );
    }
}

export default IfStatementEmitter;
