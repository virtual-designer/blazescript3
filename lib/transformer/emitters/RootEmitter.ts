import ESTree from "estree";
import RootNode from "../../frontend/tree/RootNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class RootEmitter extends ESTreeEmitter<RootNode, ESTree.Program> {
    public override readonly NODE_TYPE = RootNode;

    public override emit(
        node: RootNode,
        context: TransformerContext
    ): ESTree.Program {
        return {
            type: "Program",
            sourceType: "script",
            body: node.children.map(c =>
                this.transformer.transformBlockChild(c, context)
            )
        };
    }
}

export default RootEmitter;
