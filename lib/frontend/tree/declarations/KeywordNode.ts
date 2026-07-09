import type Token from "../../lexer/Token.ts";
import AbstractNode from "../AbstractNode.ts";

abstract class KeywordNode extends AbstractNode {
    public readonly token: Token;

    public constructor(token: Token) {
        super(token.location);
        this.token = token;
    }
}

export default KeywordNode;
