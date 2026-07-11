import type { Diagnostic } from "../../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../../diagnostic/DiagnosticLevel.ts";
import Token from "../lexer/Token.ts";
import TokenType from "../lexer/TokenType.ts";
import type AbstractNode from "../tree/AbstractNode.ts";
import type DeclarationNode from "../tree/DeclarationNode.ts";
import { AccessModifier } from "../tree/declarations/AccessModifier.ts";
import AccessModifierNode from "../tree/declarations/AccessModifierNode.ts";
import AnnotationNode from "../tree/declarations/AnnotationNode.ts";
import ClassDeclarationNode from "../tree/declarations/ClassDeclarationNode.ts";
import { ClassKind } from "../tree/declarations/ClassKind.ts";
import ClassKindNode from "../tree/declarations/ClassKindNode.ts";
import { ClassMemberModifier } from "../tree/declarations/ClassMemberModifier.ts";
import ClassMethodDeclarationNode from "../tree/declarations/ClassMethodDeclarationNode.ts";
import { ClassMethodModifier } from "../tree/declarations/ClassMethodModifier.ts";
import { ClassModifier } from "../tree/declarations/ClassModifier.ts";
import ClassPropertyDeclarationNode from "../tree/declarations/ClassPropertyDeclarationNode.ts";
import type { ClassPropertyModifier } from "../tree/declarations/ClassPropertyModifier.ts";
import { FunctionDeclarationModifier } from "../tree/declarations/FunctionDeclarationModifier.ts";
import FunctionDeclarationNode from "../tree/declarations/FunctionDeclarationNode.ts";
import FunctionParameterDeclarationNode from "../tree/declarations/FunctionParameterDeclarationNode.ts";
import ModifierListNode from "../tree/declarations/ModifierListNode.ts";
import PackageDeclarationNode from "../tree/declarations/PackageDeclarationNode.ts";
import VariableDeclarationKind from "../tree/declarations/VariableDeclarationKind.ts";
import VariableDeclarationKindNode from "../tree/declarations/VariableDeclarationKindNode.ts";
import VariableDeclarationNode from "../tree/declarations/VariableDeclarationNode.ts";
import type ExpressionNode from "../tree/ExpressionNode.ts";
import AssignmentExpressionNode from "../tree/expressions/AssignmentExpressionNode.ts";
import {
    AssignmentLValueExpressions,
    type AssignmentLValueExpression
} from "../tree/expressions/AssignmentLValueExpression.ts";
import { AssignmentOperator } from "../tree/expressions/AssignmentOperator.ts";
import AwaitExpressionNode from "../tree/expressions/AwaitExpressionNode.ts";
import BinaryExpressionNode from "../tree/expressions/BinaryExpressionNode.ts";
import BinaryOperator, {
    type ComparisonOperator
} from "../tree/expressions/BinaryOperator.ts";
import CallExpressionNode from "../tree/expressions/CallExpressionNode.ts";
import IdentifierNode from "../tree/expressions/IdentifierNode.ts";
import LiteralNode from "../tree/expressions/LiteralNode.ts";
import LiteralNodeKind from "../tree/expressions/LiteralNodeKind.ts";
import MatchExpressionCaseNode, {
    MatchExpressionCaseKind
} from "../tree/expressions/MatchExpressionCaseNode.ts";
import MatchExpressionNode from "../tree/expressions/MatchExpressionNode.ts";
import MemberAccessExpressionNode from "../tree/expressions/MemberAccessExpressionNode.ts";
import NewExpressionNode from "../tree/expressions/NewExpressionNode.ts";
import RangeExpressionNode from "../tree/expressions/RangeExpressionNode.ts";
import type { TypeExpressionNode } from "../tree/expressions/TypeExpressionNode.ts";
import { UnaryExpressionKind } from "../tree/expressions/UnaryExpressionKind.ts";
import UnaryExpressionNode from "../tree/expressions/UnaryExpressionNode.ts";
import UnaryOperator from "../tree/expressions/UnaryOperator.ts";
import { combineLocations, type Location } from "../tree/Location.ts";
import NodeType from "../tree/NodeType.ts";
import RootNode from "../tree/RootNode.ts";
import BlockStatementNode from "../tree/statements/BlockStatementNode.ts";
import EmptyStatementNode from "../tree/statements/EmptyStatementNode.ts";
import ExpressionStatementNode from "../tree/statements/ExpressionStatementNode.ts";
import ForInStatementNode from "../tree/statements/ForInStatementNode.ts";
import ForStatementNode from "../tree/statements/ForStatementNode.ts";
import IfStatementNode from "../tree/statements/IfStatementNode.ts";
import ImportStatementNode from "../tree/statements/ImportStatementNode.ts";
import ReturnStatementNode from "../tree/statements/ReturnStatementNode.ts";
import WhileStatementNode from "../tree/statements/WhileStatementNode.ts";
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
    unexpected(token: Token | null | undefined): never;
    assertStackEmpty(message?: string): void;
    semicolon: boolean;
};

type ErrorOptions = {
    message: string;
    nodes?: (AbstractNode | Token)[];
    location?: Location;
};

class Parser {
    protected readonly accessModifierTokens = {
        [TokenType.Public]: AccessModifier.Public,
        [TokenType.Private]: AccessModifier.Private,
        [TokenType.Protected]: AccessModifier.Protected,
        [TokenType.Internal]: AccessModifier.Internal
    } as const;

    protected readonly classModifierTokens = {
        [TokenType.Abstract]: ClassModifier.Abstract,
        [TokenType.Sealed]: ClassModifier.Sealed
    } as const;

    protected readonly classMemberModifierTokens = {
        [TokenType.Override]: ClassMemberModifier.Override,
        [TokenType.Static]: ClassMemberModifier.Static
    } as const;

    protected readonly functionModifierTokens = {
        [TokenType.Async]: FunctionDeclarationModifier.Async,
        [TokenType.Operator]: FunctionDeclarationModifier.Operator,
        [TokenType.Infix]: FunctionDeclarationModifier.Infix
    } as const;

    protected readonly modifierTokens = {
        ...this.accessModifierTokens,
        ...this.functionModifierTokens,
        ...this.classModifierTokens,
        ...this.classMemberModifierTokens
    };

    protected readonly noSemicolonStatementTypes = [
        NodeType.IfStatement,
        NodeType.ForStatement,
        NodeType.ForInStatement,
        NodeType.WhileStatement,
        NodeType.EmptyStatement,
        NodeType.FunctionDeclaration,
        NodeType.ClassDeclaration,
        NodeType.ClassMethodDeclaration
    ];

    protected readonly spaceshipOperatorMap = {
        [TokenType.Spaceship]: BinaryOperator.Spaceship
    } as const;

    protected readonly assignmentOperatorMap = {
        [TokenType.Equal]: AssignmentOperator.Assignment
    } satisfies Record<number, AssignmentOperator>;

    protected readonly comparisonOperatorMap = {
        [TokenType.EqualEqual]: BinaryOperator.Equal,
        [TokenType.NotEqual]: BinaryOperator.NotEqual,
        [TokenType.LessThan]: BinaryOperator.LessThan,
        [TokenType.LessThanEqual]: BinaryOperator.LessThanOrEqual,
        [TokenType.GreaterThan]: BinaryOperator.GreaterThan,
        [TokenType.GreaterThanEqual]: BinaryOperator.GreaterThanOrEqual
    } as const;

    protected readonly additiveArithmeticOperatorMap = {
        [TokenType.Plus]: BinaryOperator.Plus,
        [TokenType.Minus]: BinaryOperator.Minus
    } as const;

    protected readonly multiplicativeArithmeticOperatorMap = {
        [TokenType.Modulus]: BinaryOperator.Modulus,
        [TokenType.Times]: BinaryOperator.Multiply,
        [TokenType.Slash]: BinaryOperator.Divide
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

    protected readonly binaryOperatorPrecedencyRules = [
        {
            tokenMap: this.multiplicativeArithmeticOperatorMap,
            leftBindingPower: 50,
            rightBindingPower: 50
        },
        {
            tokenMap: this.additiveArithmeticOperatorMap,
            leftBindingPower: 40,
            rightBindingPower: 40
        },
        {
            tokenMap: this.comparisonOperatorMap,
            leftBindingPower: 20,
            rightBindingPower: 20
        },
        {
            tokenMap: this.spaceshipOperatorMap,
            leftBindingPower: 10,
            rightBindingPower: 10
        }
    ]
        .map(o => {
            const record = Object.create(null);

            for (const key of Object.getOwnPropertyNames(o.tokenMap)) {
                record[+key] = [
                    o.leftBindingPower,
                    o.rightBindingPower,
                    o.tokenMap[+key as keyof typeof o.tokenMap]
                ];
            }

            return record as Record<
                TokenType,
                [number, number, BinaryOperator]
            >;
        })
        .reduce(
            (acc, value) => Object.assign(acc, value),
            {} as Record<TokenType, [number, number, BinaryOperator]>
        );

    public readonly diagnostics: Diagnostic[] = [];

    protected error(options: ErrorOptions): never {
        throw new ParserError(
            options.message,
            options.nodes
                ? this.combineLocations(...options.nodes)
                : options.location!
        );
    }

    protected diagnostic(diagnostic: Diagnostic): never {
        throw new ParserError("", diagnostic.location, diagnostic);
    }

    protected pushDiagnostic(diagnostic: Diagnostic) {
        this.diagnostics.push(diagnostic);
    }

    protected combineLocations(
        ...nodes: (AbstractNode | Token | null | undefined)[]
    ): Location {
        return combineLocations(...nodes);
    }

    public parse(tokens: Iterable<Token>, semicolon = true) {
        const tokenArray = [...tokens];
        const context: ParserContext = {
            tokens: tokenArray,
            index: 0,
            tokenCount: tokenArray.length,
            tokenStack: [],
            semicolon,
            isEOF: (): boolean =>
                context.index >= context.tokenCount ||
                context.peek()?.type === TokenType.EOF,
            peek: (index = 0) =>
                context.tokens.at(context.index + index) ?? null,
            consume: () => context.tokens.at(context.index++) ?? null,
            unexpected: token => {
                if (!token) {
                    throw new ParserError(
                        "Unexpected end of file",
                        context.tokens.at(-1)!.location
                    );
                }

                throw new ParserError(
                    `Unexpected token: ${token.value}`,
                    token.location
                );
            },
            expect: (types): Token => {
                const token = context.consume();

                if (!token) {
                    throw new ParserError(
                        "Unexpected end of file",
                        context.tokens.at(-1)!.location
                    );
                }

                if (types && !types.includes(token.type)) {
                    context.unexpected(token);
                }

                return token;
            },
            assertStackEmpty: message => {
                if (context.tokenStack.length) {
                    throw new ParserError(
                        message ??
                            `Unexpected token: ${context.tokenStack[0]!.value}`,
                        context.tokenStack[0]!.location
                    );
                }
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

    /* Expression parsing. */

    protected parseExpression(context: ParserContext): ExpressionNode {
        return this.parseAssignmentExpression(context);
    }

    protected parseIdentifier(context: ParserContext): IdentifierNode {
        const token = context.expect([TokenType.Identifier]);
        const node = new IdentifierNode(token.value, token.location);
        return node;
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

    protected parseAwaitExpression(context: ParserContext): ExpressionNode {
        const token = context.expect([TokenType.Await]);
        const operand = this.parseExpression(context);
        return new AwaitExpressionNode(
            operand,
            this.combineLocations(token, operand)
        );
    }

    protected parsePrimaryExpression(context: ParserContext): ExpressionNode {
        switch (context.peek()?.type) {
            case TokenType.Match:
                return this.parseMatchExpression(context);

            case TokenType.Await:
                return this.parseAwaitExpression(context);

            case TokenType.New:
                return this.parseNewExpression(context);

            case TokenType.ParenthesisOpen:
                context.consume();
                const expression = this.parseExpression(context);
                context.expect([TokenType.ParenthesisClose]);
                return expression;

            default:
                return this.parseSimpleExpression(context);
        }
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

    protected parseNewExpression(context: ParserContext): ExpressionNode {
        const newToken = context.expect([TokenType.New]);
        const expression = this.parseCallExpression(context);

        if (!(expression instanceof CallExpressionNode)) {
            context.unexpected(context.peek());
        }

        return new NewExpressionNode(
            expression.callee,
            expression.args,
            this.combineLocations(newToken, expression)
        );
    }

    protected parseCallExpression(context: ParserContext): ExpressionNode {
        let node: ExpressionNode = this.parseMemberAccessExpression(context);

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

    protected parseMemberAccessExpression(
        context: ParserContext
    ): ExpressionNode {
        let target: ExpressionNode = this.parsePrimaryExpression(context);

        while (
            !context.isEOF() &&
            (context.peek()?.type === TokenType.Dot ||
                (context.peek()?.type === TokenType.QuestionMark &&
                    context.peek(1)?.type === TokenType.Dot))
        ) {
            const optional =
                context.expect([TokenType.Dot, TokenType.QuestionMark])
                    ?.type === TokenType.QuestionMark;

            if (optional) {
                context.expect([TokenType.Dot]);
            }

            const identifier = this.parseIdentifier(context);
            target = new MemberAccessExpressionNode(
                target,
                identifier,
                optional,
                this.combineLocations(target, identifier)
            );
        }

        return target;
    }

    protected parsePostfixUnaryExpression(
        context: ParserContext
    ): ExpressionNode {
        let expression = this.parseCallExpression(context);
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

    protected parseBasicBinaryExpression(
        context: ParserContext,
        minBindingPower = Number.NEGATIVE_INFINITY
    ) {
        let left = this.parsePrefixUnaryExpression(context);

        while (!context.isEOF()) {
            const currentToken = context.peek();

            if (!currentToken) {
                throw new ParserError(
                    "Unexpected end of file",
                    context.tokens.at(0)!.location
                );
            }

            if (currentToken.type in this.binaryOperatorPrecedencyRules) {
                const [leftBindingPower, rightBindingPower, operator] =
                    this.binaryOperatorPrecedencyRules[currentToken.type] ?? [];

                if (leftBindingPower <= minBindingPower) {
                    break;
                }

                if (operator === undefined) {
                    context.unexpected(currentToken);
                }

                context.consume();

                const right = this.parseBasicBinaryExpression(
                    context,
                    rightBindingPower
                );

                left = new BinaryExpressionNode(
                    operator,
                    left,
                    right,
                    this.combineLocations(left, right)
                );
            } else {
                break;
            }
        }

        return left;
    }

    protected parseAssignmentExpression(
        context: ParserContext
    ): ExpressionNode {
        let left: ExpressionNode = this.parseRangeExpression(context);

        if (!AssignmentLValueExpressions.includes(left.type)) {
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

        const operator: AssignmentOperator =
            this.assignmentOperatorMap[
                token.type as keyof typeof this.assignmentOperatorMap
            ];

        if (!(token.type in this.assignmentOperatorMap)) {
            this.error({ message: `Unexpected token`, nodes: [token] });
        }

        context.consume();

        if (!AssignmentLValueExpressions.includes(left.type)) {
            this.error({ message: "Expected lvalue", nodes: [left] });
        }

        const right = this.parseAssignmentExpression(context);

        left = new AssignmentExpressionNode(
            operator,
            left as AssignmentLValueExpression,
            right,
            this.combineLocations(left, right)
        );

        return left;
    }

    protected parseRangeExpression(context: ParserContext): ExpressionNode {
        const left = this.parseBasicBinaryExpression(context);

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

        const right = this.parseBasicBinaryExpression(context);

        return new RangeExpressionNode(
            left,
            right,
            leftInclusive,
            rightInclusive,
            this.combineLocations(left, right)
        );
    }

    /* Type expression parsing. */

    protected parseTypeExpression(context: ParserContext): TypeExpressionNode {
        return this.parseTypeBinaryExpression(context);
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

    /* Declaration parsing. */

    protected bufferModifiers(context: ParserContext) {
        while (
            !context.isEOF() &&
            context.peek() &&
            context.peek()!.type in this.modifierTokens
        ) {
            context.tokenStack.push(context.consume()!);
        }
    }

    protected parseAnnotations(context: ParserContext) {
        const annotations = [];

        while (!context.isEOF() && context.peek()?.type === TokenType.At) {
            const atToken = context.consume();
            const callExpression = this.parseCallExpression(context);

            if (
                !(
                    (callExpression instanceof CallExpressionNode &&
                        (callExpression.callee instanceof
                            MemberAccessExpressionNode ||
                            callExpression.callee instanceof IdentifierNode)) ||
                    callExpression instanceof IdentifierNode
                )
            ) {
                context.unexpected(context.peek());
            }

            annotations.push(
                new AnnotationNode(
                    callExpression instanceof CallExpressionNode
                        ? (callExpression.callee as
                              | MemberAccessExpressionNode
                              | IdentifierNode)
                        : (callExpression as IdentifierNode),
                    callExpression instanceof CallExpressionNode
                        ? callExpression.args
                        : [],
                    this.combineLocations(atToken, callExpression)
                )
            );
        }

        return annotations;
    }

    protected parseDeclaration(context: ParserContext): DeclarationNode | null {
        let node: DeclarationNode;
        const annotations = this.parseAnnotations(context);

        this.bufferModifiers(context);

        switch (context.peek()?.type) {
            case TokenType.Let:
            case TokenType.Const:
            case TokenType.Final:
                node = this.parseVariableDeclaration(context);
                break;

            case TokenType.Function:
                node = this.parseFunctionDeclaration(context, annotations);
                break;

            case TokenType.Record:
            case TokenType.Annotation:
            case TokenType.Class:
                node = this.parseClassDeclaration(context, annotations);
                break;

            case TokenType.Package:
                node = this.parsePackageDeclaration(context);
                break;

            default:
                return null;
        }

        if (annotations.length) {
            context.unexpected(context.peek());
        }

        this.trimSemicolons(context, context.semicolon, node);
        return node;
    }

    protected parseModifiers<T extends number>(
        context: ParserContext,
        map: Partial<Record<TokenType, T>>,
        conflictMessage?: (isConflicting: boolean, token: Token) => string
    ) {
        const modifierMap = new Map<T, Token>();

        this.bufferModifiers(context);

        for (let index = 0; index < context.tokenStack.length; ) {
            const token = context.tokenStack[index]!;
            const modifier = map[token.type];

            if (modifier !== undefined) {
                if (modifierMap.has(modifier)) {
                    const isConflicting =
                        modifierMap.get(modifier)?.value !== token.value;

                    this.diagnostic({
                        code: DiagnosticCode.ConflictingModifiers,
                        level: DiagnosticLevel.Error,
                        message:
                            conflictMessage?.(isConflicting, token) ??
                            `${isConflicting ? "Conflicting" : "Duplicate"} modifier '${token.value}'`,
                        location: token.location
                    });
                }

                modifierMap.set(modifier, token);
                context.tokenStack.splice(index, 1);
                continue;
            }

            index++;
        }

        return modifierMap.size ? new ModifierListNode(modifierMap) : null;
    }

    protected parseClassMemberModifiers(context: ParserContext) {
        return this.parseModifiers<ClassMemberModifier>(
            context,
            this.classMemberModifierTokens
        );
    }

    protected parseClassDeclarationModifiers(context: ParserContext) {
        return this.parseModifiers<ClassModifier>(
            context,
            this.classModifierTokens
        );
    }

    protected parseFunctionDeclarationModifiers(context: ParserContext) {
        return this.parseModifiers<FunctionDeclarationModifier>(
            context,
            this.functionModifierTokens
        );
    }

    protected parseDeclarationAccessModifier(context: ParserContext) {
        let accessModifierToken: Token | null = null;

        this.bufferModifiers(context);

        for (let index = 0; index < context.tokenStack.length; ) {
            const token = context.tokenStack[index]!;

            if (token.type in this.accessModifierTokens) {
                if (accessModifierToken) {
                    if (
                        token.location.start[0] !==
                        accessModifierToken.location.start[0]
                    ) {
                        this.pushDiagnostic({
                            code: DiagnosticCode.ConflictingModifiers,
                            level: DiagnosticLevel.Note,
                            message: "Previous modifier applied here",
                            location: accessModifierToken.location
                        });
                    }

                    this.diagnostic({
                        code: DiagnosticCode.ConflictingModifiers,
                        level: DiagnosticLevel.Error,
                        message: `${token.value === accessModifierToken.value ? "Duplicate" : "Conflicting"} access modifier '${token.value}'`,
                        location: token.location,
                        suggestions: [
                            ...(token.location.start[0] ===
                            accessModifierToken.location.start[0]
                                ? [
                                      {
                                          message:
                                              "Previous modifier applied here",
                                          columnOffset:
                                              accessModifierToken.location
                                                  .start[1] - 1
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

                accessModifierToken = token;
                context.tokenStack.splice(index, 1);
                continue;
            }

            index++;
        }

        return accessModifierToken
            ? new AccessModifierNode(accessModifierToken)
            : null;
    }

    protected parseFunctionDeclaration(
        context: ParserContext,
        annotations: AnnotationNode[]
    ): FunctionDeclarationNode {
        const accessModifier = this.parseDeclarationAccessModifier(context);
        const functionModifiers =
            this.parseFunctionDeclarationModifiers(context);

        context.assertStackEmpty();

        const token = context.expect([TokenType.Function]);
        const identifier = this.parseIdentifier(context);
        const parameters: FunctionParameterDeclarationNode[] = [];

        context.expect([TokenType.ParenthesisOpen]);

        while (
            !context.isEOF() &&
            context.peek()?.type !== TokenType.ParenthesisClose
        ) {
            const annotations = this.parseAnnotations(context);
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
                    annotations,
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

        const body = this.parseBlockStatement(context);
        const copyAnnotations = [...annotations];
        annotations.length = 0;

        return new FunctionDeclarationNode(
            identifier,
            returnType,
            parameters,
            accessModifier,
            functionModifiers,
            copyAnnotations,
            body,
            this.combineLocations(
                ...copyAnnotations,
                accessModifier,
                functionModifiers,
                token,
                identifier,
                body
            )
        );
    }

    protected parseClassPropertyDeclaration(
        context: ParserContext,
        annotations: AnnotationNode[]
    ): ClassPropertyDeclarationNode {
        const modifiers = this.parseClassMemberModifiers(context);
        const declaration = this.parseVariableDeclaration(context);
        context.assertStackEmpty();

        const copyAnnotations = [...annotations];
        annotations.length = 0;

        return new ClassPropertyDeclarationNode(
            declaration.kind,
            declaration.identifier,
            declaration.annotatedType,
            declaration.accessModifier,
            modifiers as unknown as ModifierListNode<ClassPropertyModifier>,
            declaration.defaultValue,
            copyAnnotations,
            this.combineLocations(...copyAnnotations, modifiers, declaration)
        );
    }

    protected parseClassMethodDeclaration(
        context: ParserContext,
        annotations: AnnotationNode[]
    ): ClassMethodDeclarationNode {
        const modifiers = this.parseClassMemberModifiers(context);
        const declaration = this.parseFunctionDeclaration(context, []);
        context.assertStackEmpty();

        if (declaration.annotations.length) {
            this.diagnostic({
                code: DiagnosticCode.IllegalAnnotationApplication,
                level: DiagnosticLevel.Error,
                location:
                    declaration.annotations.at(0)?.location ??
                    declaration.location,
                message: "Annotation application is not allowed here"
            });
        }

        const copyAnnotations = [...annotations];
        declaration.annotations.length = 0;
        annotations.length = 0;

        return new ClassMethodDeclarationNode(
            declaration.identifier,
            declaration.returnType,
            declaration.parameters,
            declaration.accessModifier,
            modifiers as unknown as ModifierListNode<ClassMethodModifier>,
            declaration.functionModifiers,
            copyAnnotations,
            declaration.body,
            this.combineLocations(...copyAnnotations, modifiers, declaration)
        );
    }

    protected parseClassMemberDeclaration(
        context: ParserContext
    ): ClassMethodDeclarationNode | ClassPropertyDeclarationNode {
        let node: ClassMethodDeclarationNode | ClassPropertyDeclarationNode;
        const annotations = this.parseAnnotations(context);

        this.bufferModifiers(context);

        switch (context.peek()?.type) {
            case TokenType.Final:
            case TokenType.Const:
            case TokenType.Let:
                node = this.parseClassPropertyDeclaration(context, annotations);
                break;

            case TokenType.Function:
                node = this.parseClassMethodDeclaration(context, annotations);
                break;

            default:
                context.unexpected(context.peek());
        }

        if (annotations.length) {
            context.unexpected(context.peek());
        }

        this.trimSemicolons(context, undefined, node);
        return node;
    }

    protected parseClassDeclaration(
        context: ParserContext,
        annotations: AnnotationNode[]
    ): ClassDeclarationNode {
        const accessModifier = this.parseDeclarationAccessModifier(context);
        context.assertStackEmpty();

        const kindToken =
            context.peek()?.type === TokenType.Record ||
            context.peek()?.type === TokenType.Annotation
                ? context.consume()
                : null;

        this.bufferModifiers(context);
        const classModifiers = this.parseClassDeclarationModifiers(context);
        context.assertStackEmpty();

        const classToken = context.expect([TokenType.Class]);
        const identifier = this.parseIdentifier(context);
        const properties = new Map<string, ClassPropertyDeclarationNode>();
        const methods = new Map<string, ClassMethodDeclarationNode>();

        context.expect([TokenType.BraceOpen]);

        while (
            !context.isEOF() &&
            context.peek()?.type !== TokenType.BraceClose
        ) {
            const member = this.parseClassMemberDeclaration(context);

            if (member instanceof ClassMethodDeclarationNode) {
                methods.set(member.identifier.symbol, member);
            } else if (member instanceof ClassPropertyDeclarationNode) {
                properties.set(member.identifier.symbol, member);
            } else {
                // @ts-ignore
                let _x: never = member;
            }
        }

        context.expect([TokenType.BraceClose]);
        const copyAnnotations = [...annotations];
        annotations.length = 0;

        return new ClassDeclarationNode(
            new ClassKindNode(
                kindToken?.type === TokenType.Annotation
                    ? ClassKind.Annotation
                    : kindToken?.type === TokenType.Record
                      ? ClassKind.Record
                      : ClassKind.Regular,
                kindToken ?? classToken
            ),
            accessModifier,
            classModifiers,
            identifier,
            properties,
            methods,
            copyAnnotations,
            this.combineLocations(
                kindToken,
                classToken,
                accessModifier,
                classModifiers,
                identifier,
                ...properties.values(),
                ...methods.values(),
                ...copyAnnotations
            )
        );
    }

    protected parseVariableDeclaration(
        context: ParserContext,
        parseInit = true,
        inline = false
    ): VariableDeclarationNode {
        const accessModifier = this.parseDeclarationAccessModifier(context);

        context.assertStackEmpty();

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
            new VariableDeclarationKindNode(
                keywordToken.type === TokenType.Let
                    ? VariableDeclarationKind.Let
                    : keywordToken.type === TokenType.Final
                      ? VariableDeclarationKind.Final
                      : VariableDeclarationKind.Const,
                keywordToken
            ),
            new IdentifierNode(identifier.value, identifier.location),
            annotatedType,
            accessModifier,
            value,
            inline,
            this.combineLocations(
                accessModifier,
                keywordToken,
                value,
                annotatedType,
                identifier
            )
        );
    }

    protected parsePackageDeclaration(context: ParserContext): AbstractNode {
        const packageToken = context.expect([TokenType.Package]);
        const path: IdentifierNode[] = [];

        while (context.peek()?.type === TokenType.Identifier) {
            path.push(this.parseIdentifier(context));

            if (
                context.peek()?.type !== TokenType.Semicolon &&
                context.peek(1)?.type === TokenType.Identifier
            ) {
                context.expect([TokenType.Dot]);
            }
        }

        return new PackageDeclarationNode(
            path,
            this.combineLocations(packageToken, ...path)
        );
    }

    /* Statement parsing. */

    protected trimSemicolons(
        context: ParserContext,
        semicolon: boolean = context.semicolon,
        node?: AbstractNode
    ) {
        if (
            semicolon &&
            node &&
            !this.noSemicolonStatementTypes.includes(node.type)
        ) {
            context.expect([TokenType.Semicolon]);
        }

        if (semicolon) {
            while (
                !context.isEOF() &&
                context.peek()?.type === TokenType.Semicolon
            ) {
                context.consume();
            }
        }
    }

    protected parseStatement(context: ParserContext): AbstractNode {
        let node: AbstractNode | null = this.parseDeclaration(context);

        if (node) {
            return node;
        }

        context.assertStackEmpty();

        switch (context.peek()?.type) {
            case TokenType.If:
                node = this.parseIfStatement(context);
                break;

            case TokenType.For:
                node = this.parseForStatement(context);
                break;

            case TokenType.While:
                node = this.parseWhileStatement(context);
                break;

            case TokenType.Return:
                node = this.parseReturnStatement(context);
                break;

            case TokenType.BraceOpen:
                node = this.parseBlockStatement(context);
                break;

            case TokenType.Semicolon:
                node = this.parseEmptyStatement(context);
                break;

            case TokenType.Import:
                node = this.parseImportStatement(context);
                break;

            default:
                const expression = this.parseExpression(context);
                node = new ExpressionStatementNode(
                    expression,
                    expression.location
                );
                break;
        }

        this.trimSemicolons(context, context.semicolon, node);
        return node;
    }

    protected parseReturnStatement(context: ParserContext): AbstractNode {
        const token = context.expect([TokenType.Return]);
        const expression =
            !context.isEOF() && context.peek()?.type !== TokenType.Semicolon
                ? this.parseExpression(context)
                : null;
        return new ReturnStatementNode(
            expression,
            this.combineLocations(token, expression)
        );
    }

    protected parseBlockStatement(context: ParserContext): BlockStatementNode {
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

        const index = context.index;
        const variable = this.parseVariableDeclaration(context, false, true);

        if (context.peek()?.type === TokenType.In) {
            return this.parseForInStatement(context, forToken, variable);
        }

        context.index = index;
        const semicolon = context.semicolon;
        context.semicolon = false;

        const init =
            context.peek()?.type === TokenType.Semicolon
                ? null
                : this.parseStatement(context);

        context.semicolon = semicolon;

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

    protected parseForInStatement(
        context: ParserContext,
        forToken: Token,
        variable: VariableDeclarationNode
    ): AbstractNode {
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

    protected parseImportStatement(context: ParserContext): AbstractNode {
        const token = context.expect([TokenType.Import]);
        const path: IdentifierNode[] = [];
        let identifier: IdentifierNode | null = null;

        while (context.peek()?.type === TokenType.Identifier) {
            if (identifier) {
                path.push(identifier);
            }

            identifier = this.parseIdentifier(context);

            if (
                context.peek()?.type !== TokenType.Semicolon &&
                context.peek(1)?.type === TokenType.Identifier
            ) {
                context.expect([TokenType.Dot]);
            }
        }

        if (!identifier) {
            context.expect([TokenType.Identifier]);
            throw new Error();
        }

        return new ImportStatementNode(
            path,
            identifier,
            this.combineLocations(token, ...path, identifier)
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
}

export default Parser;
