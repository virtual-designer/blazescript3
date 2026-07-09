import type Token from "../../lexer/Token.ts";
import NodeType from "../NodeType.ts";
import type { ClassKind } from "./ClassKind.ts";
import KeywordNode from "./KeywordNode.ts";

class ClassKindNode extends KeywordNode {
    public override readonly type = NodeType.ClassKind;
    public readonly kind: ClassKind;

    public constructor(kind: ClassKind, token: Token) {
        super(token);
        this.kind = kind;
    }
}

export default ClassKindNode;
