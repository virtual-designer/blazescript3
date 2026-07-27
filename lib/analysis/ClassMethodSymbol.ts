import type ClassMethodDeclarationNode from "../frontend/tree/declarations/ClassMethodDeclarationNode.ts";
import type IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import { SymbolDefinition } from "./SymbolDefinition.ts";

export class ClassMethodSymbol extends SymbolDefinition {
    public override readonly node: ClassMethodDeclarationNode;

    public constructor(node: ClassMethodDeclarationNode, hits: number = 0) {
        super(node, hits);
        this.node = node;
    }

    public override getSymbolLocation() {
        return this.node.identifier.location;
    }

    public override getIdentifier(): IdentifierNode {
        return this.node.identifier;
    }

    public override hasExportLinkage(): boolean {
        return false;
    }
}
