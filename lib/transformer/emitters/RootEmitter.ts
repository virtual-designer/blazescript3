import ESTree from "estree";
import RootNode from "../../frontend/tree/RootNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class RootEmitter extends ESTreeEmitter<RootNode, ESTree.Program> {
    public override readonly NODE_TYPE = RootNode;

    public override emit(
        node: RootNode,
        context: TransformerContext
    ): EmitterResult<ESTree.Program> {
        const body = node.children.map(c =>
            this.transformer.transformBlockChild(c, context)
        );

        return {
            node: {
                type: "Program",
                sourceType: "script",
                body: body
                    .map(({ nextNodes, node, previousNodes }) => [
                        ...(previousNodes ?? []),
                        node,
                        ...(nextNodes ?? [])
                    ])
                    .flat() as ESTree.Statement[]
            }
        };
    }
}

export default RootEmitter;
