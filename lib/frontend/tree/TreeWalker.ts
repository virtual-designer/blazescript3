import type AbstractNode from "./AbstractNode.ts";
import type { NodeMapType } from "./NodeMap.ts";
import type NodeType from "./NodeType.ts";

export type TreeWalker<B extends AbstractNode> = {
    [T in NodeType]?: (
        node: T extends keyof NodeMapType ? NodeMapType[T] : AbstractNode
    ) =>
        | TreeWalker<
              T extends keyof NodeMapType ? NodeMapType[T] : AbstractNode
          >
        | void
        | undefined;
} & {
    _init?(node: B): TreeWalker<AbstractNode> | void | undefined;
    _cleanup?(node: B): void;
};
