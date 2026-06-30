import type { Diagnostic } from "../../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../../diagnostic/DiagnosticLevel.ts";
import Token from "../lexer/Token.ts";
import TokenType from "../lexer/TokenType.ts";
import type AbstractNode from "../tree/AbstractNode.ts";
import { AccessModifier } from "../tree/AccessModifier.ts";
import AssignmentExpressionNode from "../tree/AssignmentExpressionNode.ts";
import BinaryExpressionNode from "../tree/BinaryExpressionNode.ts";
import BinaryOperator, {
    type AssignmentOperator,
    type ComparisonOperator
} from "../tree/BinaryOperator.ts";
import BlockStatementNode from "../tree/BlockStatementNode.ts";
import CallExpressionNode from "../tree/CallExpressionNode.ts";
import type DeclarationNode from "../tree/DeclarationNode.ts";
import EmptyStatementNode from "../tree/EmptyStatementNode.ts";
import type ExpressionNode from "../tree/ExpressionNode.ts";
import ExpressionStatementNode from "../tree/ExpressionStatementNode.ts";
import ForInStatementNode from "../tree/ForInStatementNode.ts";
import ForStatementNode from "../tree/ForStatementNode.ts";
import FunctionDeclarationNode from "../tree/FunctionDeclarationNode.ts";
import FunctionParameterDeclarationNode from "../tree/FunctionParameterDeclarationNode.ts";
import IdentifierNode from "../tree/IdentifierNode.ts";
import IfStatementNode from "../tree/IfStatementNode.ts";
import LiteralNode from "../tree/LiteralNode.ts";
import LiteralNodeKind from "../tree/LiteralNodeKind.ts";
import type { Location } from "../tree/Location.ts";
import MatchExpressionCaseNode, {
    MatchExpressionCaseKind
} from "../tree/MatchExpressionCaseNode.ts";
import MatchExpressionNode from "../tree/MatchExpressionNode.ts";
import NodeType from "../tree/NodeType.ts";
import RangeExpressionNode from "../tree/RangeExpressionNode.ts";
import RootNode from "../tree/RootNode.ts";
import type { TypeExpressionNode } from "../tree/TypeExpressionNode.ts";
import { UnaryExpressionKind } from "../tree/UnaryExpressionKind.ts";
import UnaryExpressionNode from "../tree/UnaryExpressionNode.ts";
import UnaryOperator from "../tree/UnaryOperator.ts";
import VariableDeclarationKind from "../tree/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../tree/VariableDeclarationNode.ts";
import WhileStatementNode from "../tree/WhileStatementNode.ts";
import ParserError from "./ParserError.ts";

type ParserContext = {
    tokens: Token[];
    index: number;
    tokenCount: number;
    tokenStack: Token[];
    isEOF(): boolean;
    peek(index?: number): Token | null;
    consume(): Token | null;
    expect(types?: TokenType[]): Token;
};

type ErrorOptions = {
    message: string;
    nodes?: (AbstractNode | Token)[];
    location?: Location;
};

class Parser {
    protected readonly accessModifierTokens = [
        TokenType.Public,
        TokenType.Private,
        TokenType.Protected,
        TokenType.Internal
    ];

    protected readonly modifierTokens = [...this.accessModifierTokens];

    protected readonly noSemicolonStatementTypes = [
        NodeType.IfStatement,
        NodeType.ForStatement,
        NodeType.ForInStatement,
        NodeType.WhileStatement,
        NodeType.EmptyStatement,
        NodeType.FunctionDeclaration
    ];

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

    protected readonly prefixUnaryOperatorMap = {
        [TokenType.Not]: UnaryOperator.Not,
        [TokenType.Plus]: UnaryOperator.Plus,
        [TokenType.Minus]: UnaryOperator.Minus,
        [TokenType.PlusPlus]: UnaryOperator.Increment,
        [TokenType.MinusMinus]: UnaryOperator.Decrement
    } as const;

    protected readonly postfixUnaryOperatorMap = {
        [TokenType.PlusPlus]: UnaryOperator.Increment,
        [TokenType.MinusMinus]: UnaryOperator.Decrement
    } as const;

    protected readonly typeOperatorMap = {
        [TokenType.Pipe]: BinaryOperator.Union,
        [TokenType.Ampersand]: BinaryOperator.Intersection
    } as const;

    public readonly diagnostics: Diagnostic[] = [];

    protected error(options: ErrorOptions): never {
        throw new ParserError(
            options.message,
            options.nodes
                ? this.combineLocations(...options.nodes)
                : options.location!
        );
    }

    protected diagnostic(diagnostic: Diagnostic) {
        throw new ParserError("", diagnostic.location, diagnostic);
    }

    protected pushDiagnostic(diagnostic: Diagnostic) {
        this.diagnostics.push(diagnostic);
    }

    protected combineLocations(
        ...nodes: (AbstractNode | Token | null | undefined)[]
    ): Location {
        let start = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ] as readonly [number, number];
        let end = [
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
        ] as readonly [number, number];

        for (const node of nodes) {
            if (!node) {
                continue;
            }

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
            tokenStack: [],
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
            let comparisonOperator: ComparisonOperator | null = null;

            if (caseToken.type !== TokenType.Default) {
                const nextToken = context.peek();

                if (nextToken && nextToken.type in this.comparisonOperatorMap) {
                    context.consume();
                    comparisonOperator =
                        this.comparisonOperatorMap[
                            nextToken.type as keyof typeof this.comparisonOperatorMap
                        ];
                    caseExpression = this.parseExpression(context);
                } else {
                    comparisonOperator = BinaryOperator.Equal;
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
                        : MatchExpressionCaseKind.Comparison,
                    body,
                    comparisonOperator,
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

            case TokenType.Identifier:
                const identifier = this.parseIdentifier(context);

                if (context.peek()?.type === TokenType.ParenthesisOpen) {
                    return this.parseCallExpression(context, identifier);
                }

                return identifier;

            default:
                return this.parseSimpleExpression(context);
        }
    }

    protected parseIdentifier(context: ParserContext): IdentifierNode {
        const token = context.expect([TokenType.Identifier]);
        const node = new IdentifierNode(token.value, token.location);
        return node;
    }

    protected parseSimpleExpression(
        context: ParserContext
    ): IdentifierNode | LiteralNode {
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

    protected parsePrefixUnaryExpression(
        context: ParserContext
    ): ExpressionNode {
        const operators: Token[] = [];

        while (
            context.peek() &&
            context.peek()!.type in this.prefixUnaryOperatorMap
        ) {
            operators.push(context.consume()!);
        }

        if (operators.length) {
            const operand = this.parsePostfixUnaryExpression(context);
            let node = operand;

            while (operators.length) {
                const token = operators.pop()!;

                const operator =
                    this.prefixUnaryOperatorMap[
                        token.type as keyof typeof this.prefixUnaryOperatorMap
                    ];

                node = new UnaryExpressionNode(
                    operator,
                    node,
                    UnaryExpressionKind.Prefix,
                    this.combineLocations(token, operand)
                );
            }

            return node;
        }

        return this.parsePostfixUnaryExpression(context);
    }

    protected parsePostfixUnaryExpression(
        context: ParserContext
    ): ExpressionNode {
        let expression = this.parsePrimaryExpression(context);
        const operators = [];

        while (
            !context.isEOF() &&
            context.peek() &&
            context.peek()!.type in this.postfixUnaryOperatorMap
        ) {
            operators.push(context.consume()!);
        }

        if (!operators.length) {
            return expression;
        }

        for (const token of operators) {
            const operator =
                this.postfixUnaryOperatorMap[
                    token.type as keyof typeof this.postfixUnaryOperatorMap
                ];

            expression = new UnaryExpressionNode(
                operator,
                expression,
                UnaryExpressionKind.Postfix,
                this.combineLocations(expression, token)
            );
        }

        return expression;
    }

    protected parseMultiplicativeExpression(
        context: ParserContext
    ): ExpressionNode {
        let left: ExpressionNode = this.parsePrefixUnaryExpression(context);

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
            const right = this.parsePrefixUnaryExpression(context);

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
        let left: ExpressionNode = this.parseRangeExpression(context);

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
            const right = this.parseRangeExpression(context);

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
    ): TypeExpressionNode {
        if (context.peek()?.type === TokenType.ParenthesisOpen) {
            context.consume();
            const expression = this.parseTypeExpression(context);
            context.expect([TokenType.ParenthesisClose]);
            return expression;
        }

        return this.parseSimpleExpression(context);
    }

    protected parseTypeBinaryExpression(
        context: ParserContext
    ): TypeExpressionNode {
        let left: TypeExpressionNode = this.parseTypePrimaryExpression(context);

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
            ) as BinaryExpressionNode & {
                operator: typeof operator;
            };
        }

        return left;
    }

    protected parseTypeExpression(context: ParserContext): TypeExpressionNode {
        return this.parseTypeBinaryExpression(context);
    }

    protected parseDeclarationAccessModifiers(
        context: ParserContext,
        defaultValue = AccessModifier.Private
    ) {
        let accessModifier: AccessModifier | null = null;
        let modifierToken: Token | null = null;
        for (const token of context.tokenStack) {
            if (this.accessModifierTokens.includes(token.type)) {
                if (modifierToken) {
                    if (
                        token.location.start[0] !==
                        modifierToken.location.start[0]
                    ) {
                        this.pushDiagnostic({
                            code: DiagnosticCode.ConflictingAccessModifiers,
                            level: DiagnosticLevel.Note,
                            message: "Previous modifier applied here",
                            location: modifierToken.location
                        });
                    }

                    this.diagnostic({
                        code: DiagnosticCode.ConflictingAccessModifiers,
                        level: DiagnosticLevel.Error,
                        message: `Conflicting access modifier '${token.value}'`,
                        location: token.location,
                        suggestions: [
                            ...(token.location.start[0] ===
                            modifierToken.location.start[0]
                                ? [
                                      {
                                          message:
                                              "Previous modifier applied here",
                                          columnOffset:
                                              modifierToken.location.start[1] -
                                              1
                                      }
                                  ]
                                : []),
                            {
                                message:
                                    "Consider removing this extra modifier",
                                columnOffset: token.location.start[1] - 1
                            }
                        ]
                    });
                }

                modifierToken = token;
                accessModifier =
                    token.type === TokenType.Public
                        ? AccessModifier.Public
                        : token.type === TokenType.Protected
                          ? AccessModifier.Protected
                          : token.type === TokenType.Internal
                            ? AccessModifier.Internal
                            : AccessModifier.Private;
            } else {
                throw new ParserError("Unexpected modifier", token.location);
            }
        }

        const tokens = [...context.tokenStack];
        context.tokenStack.length = 0;
        accessModifier ??= defaultValue;

        return { accessModifier, accessModifierTokens: tokens };
    }

    protected parseFunctionDeclaration(
        context: ParserContext
    ): FunctionDeclarationNode {
        const { accessModifier, accessModifierTokens } =
            this.parseDeclarationAccessModifiers(context);
        const token = context.expect([TokenType.Function]);
        const identifier = this.parseIdentifier(context);
        const parameters: FunctionParameterDeclarationNode[] = [];

        context.expect([TokenType.ParenthesisOpen]);

        while (
            !context.isEOF() &&
            context.peek()?.type !== TokenType.ParenthesisClose
        ) {
            const identifier = this.parseIdentifier(context);
            let annotatedType: TypeExpressionNode | undefined;
            let defaultValue: ExpressionNode | undefined;

            if (context.peek()?.type === TokenType.Colon) {
                context.consume();
                annotatedType = this.parseTypeExpression(context);
            }

            if (context.peek()?.type === TokenType.Equal) {
                context.consume();
                defaultValue = this.parseExpression(context);
            }

            parameters.push(
                new FunctionParameterDeclarationNode(
                    identifier,
                    annotatedType,
                    defaultValue,
                    this.combineLocations(
                        identifier,
                        annotatedType,
                        defaultValue
                    )
                )
            );

            if (context.peek(1)?.type === TokenType.ParenthesisClose) {
                if (context.peek()?.type === TokenType.Comma) {
                    context.consume();
                }
            } else if (context.peek()?.type !== TokenType.ParenthesisClose) {
                context.expect([TokenType.Comma]);
            }
        }

        context.expect([TokenType.ParenthesisClose]);

        let returnType: TypeExpressionNode | undefined;

        if (context.peek()?.type === TokenType.Colon) {
            context.consume();
            returnType = this.parseTypeExpression(context);
        }

        context.expect([TokenType.BraceOpen]);

        const body: AbstractNode[] = [];

        while (
            !context.isEOF() &&
            context.peek()?.type !== TokenType.BraceClose
        ) {
            body.push(this.parseStatement(context));
        }

        const lastToken = context.expect([TokenType.BraceClose]);

        return new FunctionDeclarationNode(
            identifier,
            returnType,
            parameters,
            accessModifier,
            body,
            this.combineLocations(
                ...accessModifierTokens,
                token,
                identifier,
                lastToken
            )
        );
    }

    protected parseVariableDeclaration(
        context: ParserContext,
        parseInit = true,
        inline = false
    ): VariableDeclarationNode {
        const { accessModifier, accessModifierTokens } =
            this.parseDeclarationAccessModifiers(context);
        const keywordToken = context.expect([
            TokenType.Let,
            TokenType.Const,
            TokenType.Final
        ]);
        const identifier = context.expect([TokenType.Identifier]);
        let annotatedType: TypeExpressionNode | undefined;
        let value: ExpressionNode | undefined;

        if (context.peek()?.type === TokenType.Colon) {
            context.consume();
            annotatedType = this.parseTypeExpression(context);
        }

        if (context.peek()?.type === TokenType.Equal && parseInit) {
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
            accessModifier,
            value,
            inline,
            this.combineLocations(
                ...accessModifierTokens,
                keywordToken,
                value ?? annotatedType ?? identifier
            )
        );
    }

    protected parseBlockStatement(context: ParserContext): AbstractNode {
        const braceOpenToken = context.expect([TokenType.BraceOpen]);
        const statements = [];

        while (
            !context.isEOF() &&
            context.peek()?.type !== TokenType.BraceClose
        ) {
            statements.push(this.parseStatement(context));
        }

        const braceCloseToken = context.expect([TokenType.BraceClose]);

        return new BlockStatementNode(
            statements,
            this.combineLocations(braceOpenToken, braceCloseToken)
        );
    }

    protected parseForStatement(context: ParserContext): AbstractNode {
        const forToken = context.expect([TokenType.For]);
        context.expect([TokenType.ParenthesisOpen]);
        const init =
            context.peek()?.type === TokenType.Semicolon
                ? null
                : this.parseStatement(context, false);
        context.expect([TokenType.Semicolon]);
        const condition =
            context.peek()?.type === TokenType.Semicolon
                ? null
                : this.parseExpression(context);
        context.expect([TokenType.Semicolon]);
        const mutator =
            context.peek()?.type === TokenType.ParenthesisClose
                ? null
                : this.parseExpression(context);
        context.expect([TokenType.ParenthesisClose]);
        const body =
            context.peek()?.type === TokenType.BraceOpen
                ? this.parseBlockStatement(context)
                : this.parseStatement(context);
        return new ForStatementNode(
            init,
            condition,
            mutator,
            body,
            this.combineLocations(forToken, body)
        );
    }

    protected parseForInStatement(context: ParserContext): AbstractNode {
        const forToken = context.expect([TokenType.For]);
        context.expect([TokenType.ParenthesisOpen]);
        const variable = this.parseVariableDeclaration(context, false, true);
        context.expect([TokenType.In]);
        const expression = this.parseExpression(context);
        context.expect([TokenType.ParenthesisClose]);
        const body =
            context.peek()?.type === TokenType.BraceOpen
                ? this.parseBlockStatement(context)
                : this.parseStatement(context);

        return new ForInStatementNode(
            variable,
            expression,
            body,
            this.combineLocations(forToken, body)
        );
    }

    protected parseWhileStatement(context: ParserContext): AbstractNode {
        const whileToken = context.expect([TokenType.While]);
        context.expect([TokenType.ParenthesisOpen]);
        const condition = this.parseExpression(context);
        context.expect([TokenType.ParenthesisClose]);
        const body =
            context.peek()?.type === TokenType.BraceOpen
                ? this.parseBlockStatement(context)
                : this.parseStatement(context);

        return new WhileStatementNode(
            condition,
            body,
            this.combineLocations(whileToken, body)
        );
    }

    protected parseRangeExpression(context: ParserContext): ExpressionNode {
        const left = this.parseAdditiveExpression(context);

        if (
            context.peek()?.type !== TokenType.DotDot &&
            (context.peek()?.type !== TokenType.Not ||
                context.peek(1)?.type !== TokenType.DotDot)
        ) {
            return left;
        }

        let leftInclusive = true,
            rightInclusive = true;

        const token = context.expect([TokenType.DotDot, TokenType.Not]);

        if (token?.type === TokenType.Not) {
            leftInclusive = false;
            context.expect([TokenType.DotDot]);
        }

        if (context.peek()?.type === TokenType.Not) {
            rightInclusive = false;
            context.consume();
        }

        const right = this.parseAdditiveExpression(context);

        return new RangeExpressionNode(
            left,
            right,
            leftInclusive,
            rightInclusive,
            this.combineLocations(left, right)
        );
    }

    protected parseIfStatement(context: ParserContext): AbstractNode {
        const ifToken = context.expect([TokenType.If]);
        context.expect([TokenType.ParenthesisOpen]);
        const condition = this.parseExpression(context);
        context.expect([TokenType.ParenthesisClose]);

        let thenBlock: AbstractNode;
        let elseBlock: AbstractNode | null = null;

        if (context.peek()?.type === TokenType.BraceOpen) {
            thenBlock = this.parseBlockStatement(context);
        } else {
            thenBlock = this.parseStatement(context);
        }

        if (context.peek()?.type === TokenType.Else) {
            context.consume();

            if (context.peek()?.type === TokenType.BraceOpen) {
                elseBlock = this.parseBlockStatement(context);
            } else {
                elseBlock = this.parseStatement(context);
            }
        }

        return new IfStatementNode(
            condition,
            thenBlock,
            elseBlock,
            this.combineLocations(
                ifToken,
                thenBlock,
                ...[elseBlock].filter(v => !!v)
            )
        );
    }

    protected parseEmptyStatement(context: ParserContext): AbstractNode {
        const token = context.expect([TokenType.Semicolon]);

        while (
            !context.isEOF() &&
            context.peek()?.type === TokenType.Semicolon
        ) {
            context.consume();
        }

        return new EmptyStatementNode(token.location);
    }

    protected trimSemicolons(
        context: ParserContext,
        semicolon: boolean = false,
        node?: AbstractNode
    ) {
        if (
            semicolon &&
            node &&
            !this.noSemicolonStatementTypes.includes(node.type)
        ) {
            context.expect([TokenType.Semicolon]);
        }

        while (
            !context.isEOF() &&
            context.peek()?.type === TokenType.Semicolon
        ) {
            context.consume();
        }
    }

    protected parseDeclaration(
        context: ParserContext,
        semicolon = true
    ): DeclarationNode | null {
        let node: DeclarationNode;

        while (
            this.modifierTokens.includes(
                context.peek()?.type as TokenType.Public
            )
        ) {
            context.tokenStack.push(context.consume()!);
        }

        switch (context.peek()?.type) {
            case TokenType.Let:
            case TokenType.Const:
            case TokenType.Final:
                node = this.parseVariableDeclaration(context);
                break;

            case TokenType.Function:
                node = this.parseFunctionDeclaration(context);
                break;

            default:
                return null;
        }

        this.trimSemicolons(context, semicolon, node);
        return node;
    }

    protected parseStatement(
        context: ParserContext,
        semicolon = true
    ): AbstractNode {
        let node: AbstractNode | null = this.parseDeclaration(
            context,
            semicolon
        );

        if (node) {
            return node;
        }

        switch (context.peek()?.type) {
            case TokenType.If:
                node = this.parseIfStatement(context);
                break;

            case TokenType.For:
                node = (
                    [TokenType.Let, TokenType.Final, TokenType.Const] as (
                        | TokenType
                        | undefined
                    )[]
                ).includes(context.peek(2)?.type)
                    ? this.parseForInStatement(context)
                    : this.parseForStatement(context);
                break;

            case TokenType.While:
                node = this.parseWhileStatement(context);
                break;

            case TokenType.BraceOpen:
                node = this.parseBlockStatement(context);
                break;

            case TokenType.Semicolon:
                node = this.parseEmptyStatement(context);
                break;

            default:
                const expression = this.parseExpression(context);
                node = new ExpressionStatementNode(
                    expression,
                    expression.location
                );
                break;
        }

        this.trimSemicolons(context, semicolon, node);
        return node;
    }
}

export default Parser;
