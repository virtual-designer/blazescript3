import type BaseNode from "./BaseNode.ts";
import type { NodeMapType } from "./NodeMap.ts";
import type NodeType from "./NodeType.ts";

export type TreeWalker<B extends BaseNode> = {
    [T in NodeType]?: (
        node: NodeMapType[T]
    ) => TreeWalker<NodeMapType[T]> | void | undefined;
} & {
    _init?(node: B): TreeWalker<BaseNode> | void | undefined;
    _cleanup?(node: B): void;
    __parent?: TreeWalker<BaseNode>;
};
