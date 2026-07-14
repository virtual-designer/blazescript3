import ESTree from "estree";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import type { EmitterResult } from "./EmitterResult.ts";
import type NodeTransformer from "./NodeTransformer.ts";
import type { TransformerContext } from "./TransformerContext.ts";

export abstract class ESTreeEmitter<
    S extends AbstractNode,
    O extends ESTree.BaseNode
> {
    public abstract readonly NODE_TYPE: new (...args: never[]) => S;

    protected readonly transformer: NodeTransformer;

    public constructor(transformer: NodeTransformer) {
        this.transformer = transformer;
    }

    public static combineResult<const T extends ESTree.BaseNode>(
        mainNode: T,
        ...results: Array<EmitterResult<ESTree.BaseNode> | undefined | null>
    ) {
        const finalResult: EmitterResult<T> = {
            node: mainNode,
            nextNodes: [],
            previousNodes: []
        };

        this.combineTo(
            finalResult.previousNodes,
            finalResult.nextNodes,
            ...results
        );

        return finalResult;
    }

    protected combine<const T extends ESTree.BaseNode>(
        mainNode: T,
        ...results: Array<EmitterResult<ESTree.BaseNode> | undefined | null>
    ) {
        return ESTreeEmitter.combineResult<T>(mainNode, ...results);
    }

    public static combineTo(
        previousNodes: ESTree.BaseNode[] | undefined,
        nextNodes: ESTree.BaseNode[] | undefined,
        ...results: Array<EmitterResult<ESTree.BaseNode> | undefined | null>
    ) {
        for (const result of results) {
            if (!result) {
                continue;
            }

            if (result.nextNodes?.length) {
                nextNodes?.push(...result.nextNodes);
            }

            if (result.previousNodes?.length) {
                previousNodes?.push(...result.previousNodes);
            }
        }
    }

    protected combineTo(
        previousNodes: ESTree.BaseNode[] | undefined,
        nextNodes: ESTree.BaseNode[] | undefined,
        ...results: Array<EmitterResult<ESTree.BaseNode> | undefined | null>
    ) {
        return ESTreeEmitter.combineTo(previousNodes, nextNodes, ...results);
    }

    protected terminateOrBlock<T extends ESTree.BaseNode>(
        result: EmitterResult<T>
    ): EmitterResult<T | ESTree.BlockStatement> {
        if (result.nextNodes?.length || result.previousNodes?.length) {
            return {
                node: {
                    type: "BlockStatement",
                    body: [
                        ...(result.previousNodes ?? []),
                        result.node,
                        ...(result.nextNodes ?? [])
                    ] as ESTree.Statement[]
                }
            };
        }

        return result;
    }

    public abstract emit(
        node: S,
        context: TransformerContext
    ): EmitterResult<O>;
}
