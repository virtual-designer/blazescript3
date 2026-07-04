import ESTree from "estree";
import EmptyStatementNode from "../../frontend/tree/statements/EmptyStatementNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class EmptyStatementEmitter extends ESTreeEmitter<
    EmptyStatementNode,
    ESTree.EmptyStatement
> {
    public override readonly NODE_TYPE = EmptyStatementNode;

    public override emit(
        _node: EmptyStatementNode,
        _context: TransformerContext
    ): ESTree.EmptyStatement {
        return {
            type: "EmptyStatement"
        };
    }
}

export default EmptyStatementEmitter;
