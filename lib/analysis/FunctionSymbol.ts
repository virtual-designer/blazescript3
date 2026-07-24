import { AccessModifier } from "../frontend/tree/declarations/AccessModifier.ts";
import type FunctionDeclarationNode from "../frontend/tree/declarations/FunctionDeclarationNode.ts";
import type IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import { SymbolDefinition } from "./SymbolDefinition.ts";

export class FunctionSymbol extends SymbolDefinition {
    public override readonly node: FunctionDeclarationNode;

    public constructor(node: FunctionDeclarationNode, hits: number = 0) {
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
        return (
            this.node.accessModifier?.value === AccessModifier.Public ||
            this.node.accessModifier?.value === AccessModifier.Internal
        );
    }
}
