import Token from "../lexer/Token.ts";
import TokenType from "../lexer/TokenType.ts";
import type BaseNode from "../tree/BaseNode.ts";
import BinaryExpressionNode from "../tree/BinaryExpressionNode.ts";
import BinaryOperator from "../tree/BinaryOperator.ts";
import type ExpressionNode from "../tree/ExpressionNode.ts";
import LiteralNode from "../tree/LiteralNode.ts";
import LiteralNodeKind from "../tree/LiteralNodeKind.ts";
import type { Location } from "../tree/Location.ts";
import RootNode from "../tree/RootNode.ts";
import UnaryExpressionNode from "../tree/UnaryExpressionNode.ts";
import UnaryOperator from "../tree/UnaryOperator.ts";
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
    protected readonly comparisonOperatorMap = {
        [TokenType.EqualEqual]: BinaryOperator.Equal,
        [TokenType.NotEqual]: BinaryOperator.NotEqual,
        [TokenType.LessThan]: BinaryOperator.LessThan,
        [TokenType.LessThanEqual]: BinaryOperator.LessThanOrEqual,
        [TokenType.GreaterThan]: BinaryOperator.GreaterThan,
        [TokenType.GreaterThanEqual]: BinaryOperator.GreaterThanOrEqual
    } as const;

    protected readonly unaryOperatorMap = {
        [TokenType.Not]: UnaryOperator.Not,
        [TokenType.Plus]: UnaryOperator.Plus,
        [TokenType.Minus]: UnaryOperator.Minus
    } as const;

    protected combineLocations(...nodes: (BaseNode | Token)[]): Location {
        let start = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ] as readonly [number, number];
        let end = [
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
        ] as readonly [number, number];

        for (const node of nodes) {
            if (
                node.location.end[0] > end[0] ||
                (node.location.end[0] === end[0] &&
                    node.location.end[1] > end[1])
            ) {
                end = node.location.end;
            }

            if (
                node.location.start[0] < start[0] ||
                (node.location.start[0] === start[0] &&
                    node.location.start[1] < start[1])
            ) {
                start = node.location.start;
            }
        }

        return {
            start,
            end,
            filename: nodes[0]!.location.filename
        };
    }

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

    protected parsePrimaryExpression(context: ParserContext): ExpressionNode {
        if (context.peek()?.type === TokenType.ParenthesisOpen) {
            context.consume();
            const expression = this.parseExpression(context);
            context.expect([TokenType.ParenthesisClose]);
            return expression;
        }

        return this.parseSimpleExpression(context);
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
                throw new ParserError(
                    `Unexpected token: ${token.value}`,
                    token.location
                );
        }
    }

    protected parseUnaryExpression(context: ParserContext): ExpressionNode {
        const operators: Token[] = [];

        while (
            context.peek() &&
            context.peek()!.type in this.unaryOperatorMap
        ) {
            operators.push(context.consume()!);
        }

        if (operators.length) {
            const operand = this.parsePrimaryExpression(context);
            let node = operand;

            while (operators.length) {
                const token = operators.pop()!;

                const operator =
                    this.unaryOperatorMap[
                        token.type as keyof typeof this.unaryOperatorMap
                    ];

                node = new UnaryExpressionNode(
                    operator,
                    node,
                    this.combineLocations(token, operand)
                );
            }

            return node;
        }

        return this.parsePrimaryExpression(context);
    }

    protected parseMultiplicativeExpression(
        context: ParserContext
    ): ExpressionNode {
        let left: ExpressionNode = this.parseUnaryExpression(context);

        while (
            !context.isEOF() &&
            (context.peek()?.type === TokenType.Times ||
                context.peek()?.type === TokenType.Slash ||
                context.peek()?.type === TokenType.Modulus)
        ) {
            const operator =
                context.peek()?.type === TokenType.Times
                    ? BinaryOperator.Multiply
                    : context.peek()?.type === TokenType.Slash
                      ? BinaryOperator.Divide
                      : BinaryOperator.Modulus;

            context.consume();
            const right = this.parseUnaryExpression(context);

            left = new BinaryExpressionNode(
                operator,
                left,
                right,
                this.combineLocations(left, right)
            );
        }

        return left;
    }

    protected parseAdditiveExpression(context: ParserContext): ExpressionNode {
        let left: ExpressionNode = this.parseMultiplicativeExpression(context);

        while (
            !context.isEOF() &&
            (context.peek()?.type === TokenType.Plus ||
                context.peek()?.type === TokenType.Minus)
        ) {
            const operator =
                context.peek()?.type === TokenType.Plus
                    ? BinaryOperator.Plus
                    : BinaryOperator.Minus;

            context.consume();
            const right = this.parseMultiplicativeExpression(context);

            left = new BinaryExpressionNode(
                operator,
                left,
                right,
                this.combineLocations(left, right)
            );
        }

        return left;
    }

    protected parseComparisonExpression(
        context: ParserContext
    ): ExpressionNode {
        let left: ExpressionNode = this.parseAdditiveExpression(context);

        while (
            !context.isEOF() &&
            context.peek()?.type &&
            context.peek()!.type in this.comparisonOperatorMap
        ) {
            const operator =
                this.comparisonOperatorMap[
                    context.peek()!
                        .type as keyof typeof this.comparisonOperatorMap
                ];

            context.consume();
            const right = this.parseAdditiveExpression(context);

            left = new BinaryExpressionNode(
                operator,
                left,
                right,
                this.combineLocations(left, right)
            );
        }

        return left;
    }

    protected parseExpression(context: ParserContext): ExpressionNode {
        return this.parseComparisonExpression(context);
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
