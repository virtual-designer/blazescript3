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
        this.isInitialized = !!node.value;
        this._isAssigned = isAssigned;
        this.node = node;
    }

    public get kind() {
        return this.node.kind;
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
}
