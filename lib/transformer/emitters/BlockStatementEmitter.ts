import ESTree from "estree";
import BlockStatementNode from "../../frontend/tree/statements/BlockStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class BlockStatementEmitter extends ESTreeEmitter<
    BlockStatementNode,
    ESTree.BlockStatement
> {
    public override readonly NODE_TYPE = BlockStatementNode;

    public override emit(
        node: BlockStatementNode,
        context: TransformerContext
    ): ESTree.BlockStatement {
        return {
            type: "BlockStatement",
            body: node.children.map(c =>
                this.transformer.transformBlockChild(c, context)
            )
        };
    }
}

export default BlockStatementEmitter;
