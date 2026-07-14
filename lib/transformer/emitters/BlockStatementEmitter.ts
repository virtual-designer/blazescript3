import ESTree from "estree";
import BlockStatementNode from "../../frontend/tree/statements/BlockStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class BlockStatementEmitter extends ESTreeEmitter<
    BlockStatementNode,
    ESTree.BlockStatement
> {
    public override readonly NODE_TYPE = BlockStatementNode;

    public override emit(
        node: BlockStatementNode,
        context: TransformerContext
    ): EmitterResult<ESTree.BlockStatement> {
        const body = node.children.map(c =>
            this.transformer.transformBlockChild(c, context)
        );

        return this.combine({
            type: "BlockStatement",
            body: body
                .map(({ nextNodes, node, previousNodes }) => [
                    ...(previousNodes ?? []),
                    node,
                    ...(nextNodes ?? [])
                ])
                .flat() as ESTree.Statement[]
        });
    }
}

export default BlockStatementEmitter;
