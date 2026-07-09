import type Token from "../../lexer/Token.ts";
import NodeType from "../NodeType.ts";
import KeywordNode from "./KeywordNode.ts";
import type VariableDeclarationKind from "./VariableDeclarationKind.ts";

class VariableDeclarationKindNode extends KeywordNode {
    public override readonly type = NodeType.VariableDeclarationKind;
    public readonly value: VariableDeclarationKind;

    public constructor(kind: VariableDeclarationKind, token: Token) {
        super(token);
        this.value = kind;
    }
}

export default VariableDeclarationKindNode;
