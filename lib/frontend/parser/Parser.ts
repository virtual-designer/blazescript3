import Token from "../lexer/Token.ts";
import TokenType from "../lexer/TokenType.ts";
import AssignmentExpressionNode from "../tree/AssignmentExpressionNode.ts";
import type BaseNode from "../tree/BaseNode.ts";
import BinaryExpressionNode from "../tree/BinaryExpressionNode.ts";
import BinaryOperator, {
    type AssignmentOperator,
    type ComparsionOperator
} from "../tree/BinaryOperator.ts";
import CallExpressionNode from "../tree/CallExpressionNode.ts";
import type ExpressionNode from "../tree/ExpressionNode.ts";
import IdentifierNode from "../tree/IdentifierNode.ts";
import LiteralNode from "../tree/LiteralNode.ts";
import LiteralNodeKind from "../tree/LiteralNodeKind.ts";
import type { Location } from "../tree/Location.ts";
import MatchExpressionCaseNode, {
    MatchExpressionCaseKind
} from "../tree/MatchExpressionCaseNode.ts";
import MatchExpressionNode from "../tree/MatchExpressionNode.ts";
import NodeType from "../tree/NodeType.ts";
import RootNode from "../tree/RootNode.ts";
import UnaryExpressionNode from "../tree/UnaryExpressionNode.ts";
import UnaryOperator from "../tree/UnaryOperator.ts";
import VariableDeclarationKind from "../tree/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../tree/VariableDeclarationNode.ts";
import ParserError from "./ParserError.ts";

type ParserContext = {
    tokens: Token[];
    index: number;
    tokenCount: number;
    isEOF(): boolean;
    peek(index?: number): Token | null;
    consume(): Token | null;
    expect(types?: TokenType[]): Token;
};

type ErrorOptions = {
    message: string;
    nodes?: (BaseNode | Token)[];
    location?: Location;
};

class Parser {
    protected readonly assignmentOperatorMap = {
        [TokenType.Equal]: BinaryOperator.Assignment
    } satisfies Record<number, AssignmentOperator>;

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

    protected readonly typeOperatorMap = {
        [TokenType.Pipe]: BinaryOperator.Union,
        [TokenType.Ampersand]: BinaryOperator.Intersection
    } as const;

    protected error(options: ErrorOptions): never {
        throw new ParserError(
            options.message,
            options.nodes
                ? this.combineLocations(...options.nodes)
                : options.location!
        );
    }

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
            peek: (index = 0) =>
                context.tokens.at(context.index + index) ?? null,
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

    protected parseMatchExpression(context: ParserContext): ExpressionNode {
        const matchToken = context.expect([TokenType.Match]);

        context.expect([TokenType.ParenthesisOpen]);
        const expression = this.parseExpression(context);
        context.expect([TokenType.ParenthesisClose]);

        context.expect([TokenType.BraceOpen]);

        const cases = [];

        while (
            !context.isEOF() &&
            context.peek()?.type !== TokenType.BraceClose
        ) {
            const caseToken = context.expect([
                TokenType.Default,
                TokenType.Case
            ]);

            let condition: ExpressionNode | null = null;
            let caseExpression: ExpressionNode | null = null;
            let comparsionOperator: ComparsionOperator | null = null;

            if (caseToken.type !== TokenType.Default) {
                const nextToken = context.peek();

                if (nextToken && nextToken.type in this.comparisonOperatorMap) {
                    context.consume();
                    comparsionOperator =
                        this.comparisonOperatorMap[
                            nextToken.type as keyof typeof this.comparisonOperatorMap
                        ];
                    caseExpression = this.parseExpression(context);
                } else {
                    comparsionOperator = BinaryOperator.Equal;
                    caseExpression = this.parseExpression(context);
                }

                if (context.peek()?.type === TokenType.If) {
                    context.consume();
                    context.expect([TokenType.ParenthesisOpen]);
                    condition = this.parseExpression(context);
                    context.expect([TokenType.ParenthesisClose]);
                }
            }

            context.expect([TokenType.FatArrow]);
            const body = this.parseExpression(context);
            const semicolonToken = context.expect([TokenType.Semicolon]);

            cases.push(
                new MatchExpressionCaseNode(
                    caseToken.type === TokenType.Default
                        ? MatchExpressionCaseKind.Default
                        : MatchExpressionCaseKind.Comparsion,
                    body,
                    comparsionOperator,
                    caseExpression,
                    condition,
                    this.combineLocations(caseToken, semicolonToken)
                )
            );
        }

        const braceCloseToken = context.expect([TokenType.BraceClose]);

        return new MatchExpressionNode(
            expression,
            cases,
            this.combineLocations(matchToken, braceCloseToken)
        );
    }

    protected parsePrimaryExpression(context: ParserContext): ExpressionNode {
        switch (context.peek()?.type) {
            case TokenType.Match:
                return this.parseMatchExpression(context);

            case TokenType.ParenthesisOpen:
                context.consume();
                const expression = this.parseExpression(context);
                context.expect([TokenType.ParenthesisClose]);

                if (context.peek()?.type === TokenType.ParenthesisOpen) {
                    return this.parseCallExpression(context, expression);
                }

                return expression;

            default:
                return this.parseSimpleExpression(context);
        }
    }

    protected parseIdentifier(context: ParserContext): ExpressionNode {
        const token = context.expect([TokenType.Identifier]);
        const node = new IdentifierNode(token.value, token.location);

        if (context.peek()?.type === TokenType.ParenthesisOpen) {
            return this.parseCallExpression(context, node);
        }

        return node;
    }

    protected parseSimpleExpression(context: ParserContext): ExpressionNode {
        const token = context.peek();
        const type = token?.type;

        if (!type || !token) {
            throw new ParserError(
                `Unexpected end of file`,
                context.tokens.at(-1)!.location
            );
        }

        switch (type) {
            case TokenType.IntegerLiteral:
            case TokenType.FloatLiteral:
            case TokenType.StringLiteral:
            case TokenType.BooleanLiteral:
            case TokenType.NullLiteral:
                context.consume();
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

            case TokenType.Identifier:
                return this.parseIdentifier(context);

            default:
                throw new ParserError(
                    `Unexpected token: ${token.value}`,
                    token.location
                );
        }
    }

    protected parseCallExpression(
        context: ParserContext,
        callee: ExpressionNode
    ): ExpressionNode {
        let node: ExpressionNode = callee;

        while (context.peek()?.type === TokenType.ParenthesisOpen) {
            const args: ExpressionNode[] = [];

            context.expect([TokenType.ParenthesisOpen]);

            while (!context.isEOF()) {
                if (context.peek()?.type === TokenType.ParenthesisClose) {
                    break;
                }

                args.push(this.parseExpression(context));

                if (context.peek(1)?.type === TokenType.ParenthesisClose) {
                    if (context.peek()?.type === TokenType.Comma) {
                        context.consume();
                    }
                } else if (
                    context.peek()?.type !== TokenType.ParenthesisClose
                ) {
                    context.expect([TokenType.Comma]);
                }
            }

            const endToken = context.expect([TokenType.ParenthesisClose]);

            node = new CallExpressionNode(
                node,
                args,
                this.combineLocations(node, endToken)
            );
        }

        return node;
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

    protected parseAssignmentExpression(
        context: ParserContext
    ): ExpressionNode {
        let left: ExpressionNode = this.parseComparisonExpression(context);
        const leftTypes = [NodeType.Identifier];

        if (!leftTypes.includes(left.type)) {
            return left;
        }

        if (
            context.peek()?.type !== TokenType.Equal &&
            context.peek(1)?.type !== TokenType.Equal
        ) {
            return left;
        }

        let token: Token;

        if (context.peek()?.type === TokenType.Equal) {
            token = context.peek()!;
        } else if (context.peek(1)?.type === TokenType.Equal) {
            token = context.peek()!;
            context.consume();
        } else {
            this.error({ message: "Invalid state", nodes: [left] });
        }

        const operator =
            this.assignmentOperatorMap[
                token.type as keyof typeof this.assignmentOperatorMap
            ];

        if (!(token.type in this.assignmentOperatorMap)) {
            this.error({ message: `Unexpected token`, nodes: [token] });
        }

        context.consume();

        const right = this.parseAssignmentExpression(context);

        left = new AssignmentExpressionNode(
            operator,
            left,
            right,
            this.combineLocations(left, right)
        );

        return left;
    }

    protected parseExpression(context: ParserContext): ExpressionNode {
        return this.parseAssignmentExpression(context);
    }

    protected parseTypeSimpleExpression(
        context: ParserContext
    ): ExpressionNode {
        return this.parseIdentifier(context);
    }

    protected parseTypePrimaryExpression(
        context: ParserContext
    ): ExpressionNode {
        if (context.peek()?.type === TokenType.ParenthesisOpen) {
            context.consume();
            const expression = this.parseTypeExpression(context);
            context.expect([TokenType.ParenthesisClose]);
            return expression;
        }

        return this.parseSimpleExpression(context);
    }

    protected parseTypeBinaryExpression(context: ParserContext) {
        let left: ExpressionNode = this.parseTypePrimaryExpression(context);

        while (
            !context.isEOF() &&
            context.peek()?.type &&
            context.peek()!.type in this.typeOperatorMap
        ) {
            const operator =
                this.typeOperatorMap[
                    context.peek()!.type as keyof typeof this.typeOperatorMap
                ];

            context.consume();
            const right = this.parseTypePrimaryExpression(context);

            left = new BinaryExpressionNode(
                operator,
                left,
                right,
                this.combineLocations(left, right)
            );
        }

        return left;
    }

    protected parseTypeExpression(context: ParserContext): ExpressionNode {
        return this.parseTypeBinaryExpression(context);
    }

    protected parseVariableDeclaration(context: ParserContext): BaseNode {
        const keywordToken = context.expect([
            TokenType.Let,
            TokenType.Const,
            TokenType.Final
        ]);
        const identifier = context.expect([TokenType.Identifier]);
        let annotatedType: ExpressionNode | undefined;
        let value: ExpressionNode | undefined;

        if (context.peek()?.type === TokenType.Colon) {
            context.consume();
            annotatedType = this.parseTypeExpression(context);
        }

        if (context.peek()?.type === TokenType.Equal) {
            context.consume();
            value = this.parseExpression(context);
        }

        return new VariableDeclarationNode(
            keywordToken.type === TokenType.Let
                ? VariableDeclarationKind.Let
                : keywordToken.type === TokenType.Final
                  ? VariableDeclarationKind.Final
                  : VariableDeclarationKind.Const,
            new IdentifierNode(identifier.value, identifier.location),
            annotatedType,
            value,
            this.combineLocations(
                keywordToken,
                value ?? annotatedType ?? identifier
            )
        );
    }

    protected parseStatement(context: ParserContext): BaseNode {
        let node: BaseNode;

        switch (context.peek()?.type) {
            case TokenType.Let:
            case TokenType.Const:
            case TokenType.Final:
                node = this.parseVariableDeclaration(context);
                break;

            default:
                node = this.parseExpression(context);
                break;
        }

        while (
            !context.isEOF() &&
            context.peek()?.type === TokenType.Semicolon
        ) {
            context.consume();
        }

        return node;
    }
}

export default Parser;
