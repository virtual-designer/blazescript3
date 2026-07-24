import type AbstractNode from "./AbstractNode.ts";
import type { NodeMapType } from "./NodeMap.ts";
import type NodeType from "./NodeType.ts";
import type { NodeName } from "./TreeWalker.ts";

type TreeVisitorMethodResult = {
    cleanup?: () => void;
};

type TreeVisitorType<C extends object | undefined = undefined> = {
    [T in NodeType as `visit${NodeName<T>}`]?: (
        node: T extends keyof NodeMapType ? NodeMapType[T] : AbstractNode,
        context: C
    ) => TreeVisitorMethodResult | undefined | void;
};

export interface TreeVisitor<
    C extends object | undefined = undefined
> extends TreeVisitorType<C> {}
