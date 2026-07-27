import type ClassPropertyDeclarationNode from "../frontend/tree/declarations/ClassPropertyDeclarationNode.ts";
import type IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import { SymbolDefinition } from "./SymbolDefinition.ts";

export class ClassPropertySymbol extends SymbolDefinition {
    public override readonly node: ClassPropertyDeclarationNode;

    public constructor(node: ClassPropertyDeclarationNode, hits: number = 0) {
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
