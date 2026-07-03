import ESTree from "estree";
import LiteralNode from "../../frontend/tree/expressions/LiteralNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class LiteralEmitter extends ESTreeEmitter<LiteralNode, ESTree.Literal> {
    public override readonly NODE_TYPE = LiteralNode;

    public override emit(
        node: LiteralNode,
        _context: TransformerContext
    ): ESTree.Literal {
        return {
            type: "Literal",
            value: node.getJSValue()
        };
    }
}

export default LiteralEmitter;
