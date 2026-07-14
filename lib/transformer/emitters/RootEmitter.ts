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

        const rawNodes: ESTree.BaseNode[] = body.map(({ node }) => node);

        for (const child of body.reverse()) {
            if (child.previousNodes?.length) {
                rawNodes.unshift(...child.previousNodes);
            }
        }

        for (const child of body) {
            if (child.nextNodes?.length) {
                rawNodes.unshift(...child.nextNodes);
            }
        }

        return {
            node: {
                type: "Program",
                sourceType: "script",
                body: rawNodes as ESTree.Statement[]
            }
        };
    }
}

export default RootEmitter;
