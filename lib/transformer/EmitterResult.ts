import type ESTree from "estree";

export type EmitterResult<T extends ESTree.BaseNode> = {
    node: T;
    previousNodes?: ESTree.BaseNode[];
    nextNodes?: ESTree.BaseNode[];
};
