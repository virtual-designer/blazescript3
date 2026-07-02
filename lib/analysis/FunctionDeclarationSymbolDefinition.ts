import type FunctionDeclarationNode from "../frontend/tree/declarations/FunctionDeclarationNode.ts";
import { SymbolDefinition } from "./SymbolDefinition.ts";

export class FunctionDeclarationSymbolDefinition extends SymbolDefinition {
    public override readonly node: FunctionDeclarationNode;

    public constructor(node: FunctionDeclarationNode, hits: number = 0) {
        super(node, hits);
        this.node = node;
    }

    public override getSymbolLocation() {
        return this.node.identifier.location;
    }
}
