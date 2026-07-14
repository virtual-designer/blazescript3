import ESTree from "estree";
import IdentifierNode from "../../frontend/tree/expressions/IdentifierNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class IdentifierEmitter extends ESTreeEmitter<
    IdentifierNode,
    ESTree.Identifier
> {
    public override readonly NODE_TYPE = IdentifierNode;

    public override emit(
        node: IdentifierNode,
        _context: TransformerContext
    ): EmitterResult<ESTree.Identifier> {
        return this.combine({
            type: "Identifier",
            name: node.symbol
        });
    }
}

export default IdentifierEmitter;
