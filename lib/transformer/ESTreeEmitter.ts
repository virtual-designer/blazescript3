import ESTree from "estree";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import type NodeTransformer from "./NodeTransformer.ts";
import type { TransformerContext } from "./TransfomerContext.ts";

export abstract class ESTreeEmitter<
    S extends AbstractNode,
    O extends ESTree.BaseNode
> {
    public abstract readonly NODE_TYPE: new (...args: never[]) => S;

    protected readonly transformer: NodeTransformer;

    public constructor(transformer: NodeTransformer) {
        this.transformer = transformer;
    }

    public abstract emit(node: S, context: TransformerContext): O;
}
