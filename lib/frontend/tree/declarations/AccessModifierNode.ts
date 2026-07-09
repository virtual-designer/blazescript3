import type Token from "../../lexer/Token.ts";
import TokenType from "../../lexer/TokenType.ts";
import NodeType from "../NodeType.ts";
import { AccessModifier } from "./AccessModifier.ts";
import KeywordNode from "./KeywordNode.ts";

class AccessModifierNode extends KeywordNode {
    public override readonly type = NodeType.AccessModifierKeyword;
    public readonly value: AccessModifier;

    public constructor(token: Token) {
        super(token);
        this.value =
            token.type === TokenType.Public
                ? AccessModifier.Public
                : token.type === TokenType.Protected
                  ? AccessModifier.Protected
                  : token.type === TokenType.Internal
                    ? AccessModifier.Internal
                    : AccessModifier.Private;
    }
}

export default AccessModifierNode;
