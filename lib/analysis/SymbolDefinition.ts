import type AbstractNode from "../frontend/tree/AbstractNode.ts";

export abstract class SymbolDefinition {
    public readonly node: AbstractNode;
    private _hits: number;

    protected constructor(node: AbstractNode, hits: number) {
        this.node = node;
        this._hits = hits;
    }

    public get hits() {
        return this._hits;
    }

    public incrementHit() {
        this._hits++;
    }

    public getSymbolLocation() {
        return this.node.location;
    }
}
