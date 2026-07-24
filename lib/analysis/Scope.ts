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

        if (parent) {
            parent.children.add(this);
        }

        this.symbolTable = symbolTable;
        this.children = children;
    }

    public traverse(callback: (scope: Scope) => void) {
        callback(this);

        for (const child of this.children) {
            child.traverse(callback);
        }
    }

    public orphanize() {
        this.parent?.children.delete(this);
    }
}
