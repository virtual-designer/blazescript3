import Token from "../lexer/Token.ts";
import TokenType from "../lexer/TokenType.ts";
import type BaseNode from "../tree/BaseNode.ts";
import type ExpressionNode from "../tree/ExpressionNode.ts";
import LiteralNode from "../tree/LiteralNode.ts";
import LiteralNodeKind from "../tree/LiteralNodeKind.ts";
import RootNode from "../tree/RootNode.ts";
import ParserError from "./ParserError.ts";

type ParserContext = {
    tokens: Token[];
    index: number;
    tokenCount: number;
    isEOF(): boolean;
    peek(): Token | null;
    consume(): Token | null;
    expect(types?: TokenType[]): Token;
};

class Parser {
    public parse(tokens: Iterable<Token>) {
        const tokenArray = [...tokens];
        const context: ParserContext = {
            tokens: tokenArray,
            index: 0,
            tokenCount: tokenArray.length,
            isEOF: (): boolean =>
                context.index >= context.tokenCount ||
                context.peek()?.type === TokenType.EOF,
            peek: () => context.tokens.at(context.index) ?? null,
            consume: () => context.tokens.at(context.index++) ?? null,
            expect: (types): Token => {
                const token = context.consume();

                if (!token) {
                    throw new ParserError(
                        "Unexpected end of file",
                        context.tokens.at(-1)!.location
                    );
                }

                if (types && !types.includes(token.type)) {
                    throw new ParserError(
                        `Unexpected token: ${token.value}`,
                        token.location
                    );
                }

                return token;
            }
        };

        return this.parseRoot(context);
    }

    protected parseRoot(context: ParserContext) {
        const children = [];

        while (!context.isEOF()) {
            const node = this.parseStatement(context);
            children.push(node);
        }

        return new RootNode(children, {
            start:
                children[0]?.location.start ??
                context.tokens[0]!.location.start,
            end:
                children.at(-1)?.location.end ??
                context.tokens.at(-1)!.location.end,
            filename:
                children.at(-1)?.location.filename ??
                context.tokens.at(-1)!.location.filename
        });
    }

    protected parseSimpleExpression(context: ParserContext): ExpressionNode {
        const token = context.expect();
        const type = token.type;

        switch (type) {
            case TokenType.IntegerLiteral:
            case TokenType.FloatLiteral:
            case TokenType.StringLiteral:
            case TokenType.BooleanLiteral:
            case TokenType.NullLiteral:
                return new LiteralNode(
                    type === TokenType.IntegerLiteral
                        ? LiteralNodeKind.Integer
                        : type === TokenType.FloatLiteral
                          ? LiteralNodeKind.Float
                          : type === TokenType.StringLiteral
                            ? LiteralNodeKind.String
                            : type === TokenType.BooleanLiteral
                              ? LiteralNodeKind.Boolean
                              : LiteralNodeKind.Null,
                    token.value,
                    token.location
                );
                
            default:
                throw new ParserError(`Unexpected token: ${token.value}`, token.location);
        }
    }

    protected parseExpression(context: ParserContext): ExpressionNode {
        return this.parseSimpleExpression(context);
    }

    protected parseStatement(context: ParserContext): BaseNode {
        const expr = this.parseExpression(context);

        while (
            !context.isEOF() &&
            context.peek()?.type === TokenType.Semicolon
        ) {
            context.consume();
        }

        return expr;
    }
}

export default Parser;
