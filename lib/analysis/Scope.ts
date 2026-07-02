import type { SymbolDefinition } from "./SymbolDefinition.ts";

export class Scope {
    public readonly symbolTable: Map<string, SymbolDefinition>;
    public readonly parent: Scope | null;
    public readonly children: Set<Scope>;

    public constructor(
        parent: Scope | null,
        symbolTable: Map<string, SymbolDefinition> = new Map(),
        children: Set<Scope> = new Set()
    ) {
        this.parent = parent;
        this.symbolTable = symbolTable;
        this.children = children;
    }
}
