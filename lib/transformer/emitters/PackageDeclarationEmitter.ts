import ESTree from "estree";
import PackageDeclarationNode from "../../frontend/tree/declarations/PackageDeclarationNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class PackageDeclarationEmitter extends ESTreeEmitter<
    PackageDeclarationNode,
    ESTree.EmptyStatement
> {
    public override readonly NODE_TYPE = PackageDeclarationNode;

    public override emit(
        _node: PackageDeclarationNode,
        _context: TransformerContext
    ): EmitterResult<ESTree.EmptyStatement> {
        return {
            node: {
                type: "EmptyStatement"
            }
        };
    }
}

export default PackageDeclarationEmitter;
