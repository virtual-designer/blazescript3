import { AccessModifier } from "../frontend/tree/declarations/AccessModifier.ts";
import type VariableDeclarationNode from "../frontend/tree/declarations/VariableDeclarationNode.ts";
import type IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import { SymbolDefinition } from "./SymbolDefinition.ts";

export class VariableDeclarationSymbolDefinition extends SymbolDefinition {
    public readonly isInitialized: boolean;
    private _isAssigned: boolean;
    public override readonly node: VariableDeclarationNode;

    public constructor(
        node: VariableDeclarationNode,
        isAssigned: boolean,
        hits: number
    ) {
        super(node, hits);
        this.isInitialized = !!node.defaultValue;
        this._isAssigned = isAssigned;
        this.node = node;
    }

    public get kind() {
        return this.node.kind.value;
    }

    public get isAssigned() {
        return this._isAssigned;
    }

    public setAssigned(value: boolean = true) {
        this._isAssigned = value;
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
