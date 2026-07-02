import ESTree from "estree";
import { existsSync } from "node:fs";
import path from "node:path";
import type CompilerTransaction from "../compiler/CompilerTransaction.ts";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import { AccessModifier } from "../frontend/tree/declarations/AccessModifier.ts";
import { FunctionDeclarationModifier } from "../frontend/tree/declarations/FunctionDeclarationModifier.ts";
import type FunctionDeclarationNode from "../frontend/tree/declarations/FunctionDeclarationNode.ts";
import VariableDeclarationKind from "../frontend/tree/declarations/VariableDeclarationKind.ts";
import type VariableDeclarationNode from "../frontend/tree/declarations/VariableDeclarationNode.ts";
import ExpressionNode from "../frontend/tree/ExpressionNode.ts";
import type AssignmentExpressionNode from "../frontend/tree/expressions/AssignmentExpressionNode.ts";
import type AwaitExpressionNode from "../frontend/tree/expressions/AwaitExpressionNode.ts";
import type BinaryExpressionNode from "../frontend/tree/expressions/BinaryExpressionNode.ts";
import BinaryOperator from "../frontend/tree/expressions/BinaryOperator.ts";
import type CallExpressionNode from "../frontend/tree/expressions/CallExpressionNode.ts";
import type IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import type LiteralNode from "../frontend/tree/expressions/LiteralNode.ts";
import MatchExpressionCaseNode, {
    MatchExpressionCaseKind
} from "../frontend/tree/expressions/MatchExpressionCaseNode.ts";
import type MatchExpressionNode from "../frontend/tree/expressions/MatchExpressionNode.ts";
import type RangeExpressionNode from "../frontend/tree/expressions/RangeExpressionNode.ts";
import { UnaryExpressionKind } from "../frontend/tree/expressions/UnaryExpressionKind.ts";
import type UnaryExpressionNode from "../frontend/tree/expressions/UnaryExpressionNode.ts";
import NodeType from "../frontend/tree/NodeType.ts";
import type RootNode from "../frontend/tree/RootNode.ts";
import type BlockStatementNode from "../frontend/tree/statements/BlockStatementNode.ts";
import ExpressionStatementNode from "../frontend/tree/statements/ExpressionStatementNode.ts";
import type ForInStatementNode from "../frontend/tree/statements/ForInStatementNode.ts";
import type ForStatementNode from "../frontend/tree/statements/ForStatementNode.ts";
import type IfStatementNode from "../frontend/tree/statements/IfStatementNode.ts";
import type ImportStatementNode from "../frontend/tree/statements/ImportStatementNode.ts";
import type ReturnStatementNode from "../frontend/tree/statements/ReturnStatementNode.ts";
import type WhileStatementNode from "../frontend/tree/statements/WhileStatementNode.ts";

export type TransformerContext = {
    tx: CompilerTransaction;
    currentFile: string;
};

class Transformer {
    private readonly BLAZE_GLOBAL_SYMBOL = "__blaze";

    private randomSymbolName(suffix: string, prefix: string = "") {
        const rand = Math.floor(Math.random() * 10000);
        return `t${prefix}${rand}${suffix}`;
    }

    public transformStatement(
        node: AbstractNode,
        context: TransformerContext
    ): ESTree.BaseNode {
        switch (node.type) {
            case NodeType.Root:
                return this.transformRoot(node as RootNode, context);

            case NodeType.VariableDeclaration:
                return this.transformVariableDeclaration(
                    node as VariableDeclarationNode,
                    context
                );

            case NodeType.FunctionDeclaration:
                return this.transformFunctionDeclaration(
                    node as FunctionDeclarationNode,
                    context
                );

            case NodeType.IfStatement:
                return this.transformIfStatement(
                    node as IfStatementNode,
                    context
                );

            case NodeType.ForStatement:
                return this.transformForStatement(
                    node as ForStatementNode,
                    context
                );

            case NodeType.ForInStatement:
                return this.transformForInStatement(
                    node as ForInStatementNode,
                    context
                );

            case NodeType.WhileStatement:
                return this.transformWhileStatement(
                    node as WhileStatementNode,
                    context
                );

            case NodeType.BlockStatement:
                return this.transformBlockStatement(
                    node as BlockStatementNode,
                    context
                );

            case NodeType.ReturnStatement:
                return this.transformReturnStatement(
                    node as ReturnStatementNode,
                    context
                );

            case NodeType.ImportStatement:
                return this.transformImportStatement(
                    node as ImportStatementNode,
                    context
                );

            case NodeType.EmptyStatement:
                return { type: "EmptyStatement" };

            default:
                return {
                    type: "ExpressionStatement",
                    expression: this.transformExpression(
                        node instanceof ExpressionStatementNode
                            ? node.expression
                            : node,
                        context
                    )
                } satisfies ESTree.ExpressionStatement as ESTree.BaseNode;
        }
    }

    public transformExpression(
        node: AbstractNode,
        context: TransformerContext
    ): ESTree.Expression {
        switch (node.type) {
            case NodeType.Literal:
                return this.transformLiteral(node as LiteralNode, context);

            case NodeType.Identifier:
                return this.transformIdentifier(
                    node as IdentifierNode,
                    context
                );

            case NodeType.UnaryExpression:
                return this.transformUnaryExpression(
                    node as UnaryExpressionNode,
                    context
                );

            case NodeType.BinaryExpression:
                return this.transformBinaryExpression(
                    node as BinaryExpressionNode,
                    context
                );

            case NodeType.AssignmentExpression:
                return this.transformAssignmentExpression(
                    node as AssignmentExpressionNode,
                    context
                );

            case NodeType.CallExpression:
                return this.transformCallExpression(
                    node as CallExpressionNode,
                    context
                );

            case NodeType.MatchExpression:
                return this.transformMatchExpression(
                    node as MatchExpressionNode,
                    context
                );

            case NodeType.RangeExpression:
                return this.transformRangeExpression(
                    node as RangeExpressionNode,
                    context
                );

            case NodeType.AwaitExpression:
                return this.transformAwaitExpression(
                    node as AwaitExpressionNode,
                    context
                );

            default:
                throw new Error(`Unsupported node: ${node}`);
        }
    }

    protected transformImportStatement(
        node: ImportStatementNode,
        context: TransformerContext
    ): ESTree.ImportDeclaration {
        let filepath = [
            ...node.path.map(id => id.symbol),
            `${node.identifier.symbol}.js`
        ].join("/");

        let sourceFilePath = [
            ...node.path.map(id => id.symbol),
            `${node.identifier.symbol}.bl`
        ].join("/");

        let sourceClasspath = "";

        for (const classpath of ["", ...context.tx.getClassPaths()]) {
            const fullpath = path.join(classpath, sourceFilePath);

            if (!existsSync(fullpath)) {
                continue;
            }

            sourceClasspath = classpath;
            break;
        }

        const sourcePackageWithClassPath = path.dirname(
            context.currentFile.startsWith(sourceClasspath)
                ? context.currentFile
                      .slice(sourceClasspath.length)
                      .replaceAll(/^\/+/g, "")
                : context.currentFile
        );

        filepath = filepath.startsWith(sourcePackageWithClassPath)
            ? filepath
                  .slice(sourcePackageWithClassPath.length)
                  .replaceAll(/^\/+/g, "")
            : filepath;
        filepath = filepath.startsWith("/") ? filepath : "./" + filepath;

        return {
            type: "ImportDeclaration",
            source: {
                type: "Literal",
                value: filepath
            },
            specifiers: [
                {
                    type: "ImportSpecifier",
                    local: this.transformIdentifier(node.identifier, context),
                    imported: this.transformIdentifier(node.identifier, context)
                }
            ],
            attributes: []
        };
    }

    protected transformReturnStatement(
        node: ReturnStatementNode,
        context: TransformerContext
    ): ESTree.ReturnStatement {
        return {
            type: "ReturnStatement",
            argument: node.value
                ? this.transformExpression(node.value, context)
                : undefined
        };
    }

    protected transformBlockStatement(
        node: BlockStatementNode,
        context: TransformerContext
    ): ESTree.BlockStatement {
        return {
            type: "BlockStatement",
            body: node.children.map(c => this.transformBlockChild(c, context))
        };
    }

    protected transformForStatement(
        node: ForStatementNode,
        context: TransformerContext
    ): ESTree.ForStatement {
        return {
            type: "ForStatement",
            init: node.init
                ? (this.transformStatement(
                      node.init,
                      context
                  ) as ESTree.ChainExpression)
                : undefined,
            test: node.condition
                ? this.transformExpression(node.condition, context)
                : undefined,
            update: node.mutator
                ? this.transformExpression(node.mutator, context)
                : undefined,
            body: this.transformStatement(
                node.body,
                context
            ) as ESTree.Statement
        };
    }

    protected transformRangeExpression(
        node: RangeExpressionNode,
        context: TransformerContext
    ): ESTree.Expression {
        return {
            type: "CallExpression",
            callee: {
                type: "MemberExpression",
                object: {
                    type: "MemberExpression",
                    object: {
                        type: "Identifier",
                        name: this.BLAZE_GLOBAL_SYMBOL
                    },
                    property: {
                        type: "Identifier",
                        name: "utils"
                    },
                    computed: false,
                    optional: false
                },
                property: {
                    type: "Identifier",
                    name: "createRangeIterator"
                },
                computed: false,
                optional: false
            },
            arguments: [
                this.transformExpression(node.from, context),
                this.transformExpression(node.to, context),
                {
                    type: "Literal",
                    value: node.fromInclusive
                },
                {
                    type: "Literal",
                    value: node.toInclusive
                }
            ],
            optional: false
        };
    }

    protected transformForInStatement(
        node: ForInStatementNode,
        context: TransformerContext
    ): ESTree.ForOfStatement {
        return {
            type: "ForOfStatement",
            body: this.transformStatement(
                node.body,
                context
            ) as ESTree.Statement,
            await: false,
            left: this.transformVariableDeclaration(
                node.variable,
                context
            ) as ESTree.VariableDeclaration,
            right: this.transformExpression(node.iterable, context)
        };
    }

    protected transformWhileStatement(
        node: WhileStatementNode,
        context: TransformerContext
    ): ESTree.WhileStatement {
        return {
            type: "WhileStatement",
            test: this.transformExpression(node.condition, context),
            body: this.transformStatement(
                node.body,
                context
            ) as ESTree.Statement
        };
    }

    protected transformIfStatement(
        node: IfStatementNode,
        context: TransformerContext
    ): ESTree.IfStatement {
        return {
            type: "IfStatement",
            test: this.transformExpression(node.condition, context),
            consequent: this.transformStatement(
                node.thenBlock,
                context
            ) as ESTree.Statement,
            alternate: node.elseBlock
                ? (this.transformStatement(
                      node.elseBlock,
                      context
                  ) as ESTree.Statement)
                : undefined
        };
    }

    protected transformAwaitExpression(
        node: AwaitExpressionNode,
        context: TransformerContext
    ): ESTree.AwaitExpression {
        return {
            type: "AwaitExpression",
            argument: this.transformExpression(node.operand, context)
        };
    }

    protected transformJSBinaryOperation(
        operator: BinaryOperator,
        left: ESTree.Expression,
        right: ESTree.Expression
    ): ESTree.BinaryExpression {
        switch (operator) {
            case BinaryOperator.Spaceship:
                return {
                    type: "BinaryExpression",
                    left: {
                        type: "BinaryExpression",
                        left,
                        right,
                        operator: ">"
                    },
                    right: {
                        type: "BinaryExpression",
                        left,
                        right,
                        operator: "<"
                    },
                    operator: "-"
                };

            default:
                return {
                    type: "BinaryExpression",
                    left,
                    right,
                    operator
                };
        }
    }

    protected transformMatchExpression(
        node: MatchExpressionNode,
        context: TransformerContext
    ): ESTree.Expression {
        const subjectVarName = this.randomSymbolName("_subject");
        const body: ESTree.Statement[] = [];
        const equalCaseStack: MatchExpressionCaseNode[] = [];

        for (const definedCase of node.cases) {
            if (
                definedCase.kind === MatchExpressionCaseKind.Comparison &&
                definedCase.comparisonOperator === BinaryOperator.Equal &&
                definedCase.comparisonTarget &&
                !definedCase.condition
            ) {
                equalCaseStack.push(definedCase);
                continue;
            }

            if (equalCaseStack.length) {
                const cases: ESTree.SwitchCase[] = [];

                for (const equalCase of equalCaseStack) {
                    const consequent: ESTree.Statement = {
                        type: "ReturnStatement",
                        argument: this.transformExpression(
                            equalCase.body,
                            context
                        )
                    };

                    cases.push({
                        type: "SwitchCase",
                        test: this.transformExpression(
                            equalCase.comparisonTarget!,
                            context
                        ),
                        consequent: [consequent]
                    });
                }

                body.push({
                    type: "SwitchStatement",
                    discriminant: {
                        type: "Identifier",
                        name: subjectVarName
                    },
                    cases
                });

                equalCaseStack.length = 0;
            }

            switch (definedCase.kind) {
                case MatchExpressionCaseKind.Default:
                    body.push({
                        type: "ReturnStatement",
                        argument: this.transformExpression(
                            definedCase.body,
                            context
                        )
                    });

                    break;

                case MatchExpressionCaseKind.Comparison:
                    {
                        let cond: ESTree.Statement = {
                            type: "IfStatement",
                            test: this.transformJSBinaryOperation(
                                definedCase.comparisonOperator ||
                                    BinaryOperator.Equal,
                                {
                                    type: "Identifier",
                                    name: subjectVarName
                                },
                                this.transformExpression(
                                    definedCase.comparisonTarget!,
                                    context
                                )
                            ),
                            consequent: {
                                type: "ReturnStatement",
                                argument: this.transformExpression(
                                    definedCase.body,
                                    context
                                )
                            }
                        };

                        if (definedCase.condition) {
                            cond = {
                                type: "IfStatement",
                                test: this.transformExpression(
                                    definedCase.condition,
                                    context
                                ),
                                consequent: cond
                            };
                        }

                        body.push(cond);
                    }

                    break;

                default:
                    throw new Error("Unsupported match case");
            }
        }

        return {
            type: "CallExpression",
            callee: {
                type: "ArrowFunctionExpression",
                params: [
                    {
                        type: "Identifier",
                        name: subjectVarName
                    }
                ],
                expression: false,
                body: {
                    type: "BlockStatement",
                    body
                }
            },
            arguments: [this.transformExpression(node.subject, context)],
            optional: false
        };
    }

    protected transformCallExpression(
        node: CallExpressionNode,
        context: TransformerContext
    ): ESTree.CallExpression {
        return {
            type: "CallExpression",
            callee: this.transformExpression(node.callee, context),
            arguments: node.args.map(arg =>
                this.transformExpression(arg, context)
            ),
            optional: false
        };
    }

    protected transformFunctionDeclaration(
        node: FunctionDeclarationNode,
        context: TransformerContext
    ): ESTree.FunctionDeclaration | ESTree.ExportNamedDeclaration {
        const functionDeclaration: ESTree.FunctionDeclaration = {
            type: "FunctionDeclaration",
            body: this.transformBlockStatement(node.body, context),
            id: this.transformIdentifier(node.identifier, context),
            params: node.parameters.map(
                p =>
                    (p.defaultValue
                        ? {
                              type: "AssignmentPattern",
                              left: this.transformIdentifier(
                                  p.identifier,
                                  context
                              ),
                              right: this.transformExpression(
                                  p.defaultValue,
                                  context
                              )
                          }
                        : this.transformIdentifier(
                              p.identifier,
                              context
                          )) satisfies ESTree.FunctionDeclaration["params"][number]
            ),
            async:
                (node.functionModifiers & FunctionDeclarationModifier.Async) ===
                FunctionDeclarationModifier.Async
        };

        if (
            node.accessModifier &&
            node.accessModifier !== AccessModifier.Private
        ) {
            return this.exportDeclaration(functionDeclaration);
        }

        return functionDeclaration;
    }

    protected transformVariableDeclaration(
        node: VariableDeclarationNode,
        context: TransformerContext
    ): ESTree.VariableDeclaration | ESTree.ExportNamedDeclaration {
        const variableDeclaration: ESTree.VariableDeclaration = {
            type: "VariableDeclaration",
            kind: node.kind === VariableDeclarationKind.Let ? "let" : "const",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: this.transformIdentifier(node.identifier, context),
                    init: node.value
                        ? (this.transformExpression(
                              node.value,
                              context
                          ) as ESTree.Expression)
                        : undefined
                }
            ]
        };

        if (
            node.accessModifier &&
            node.accessModifier !== AccessModifier.Private
        ) {
            return this.exportDeclaration(variableDeclaration);
        }

        return variableDeclaration;
    }

    protected exportDeclaration(
        node: ESTree.Declaration
    ): ESTree.ExportNamedDeclaration {
        return {
            type: "ExportNamedDeclaration",
            declaration: node,
            specifiers: [],
            attributes: []
        };
    }

    protected transformAssignmentExpression(
        node: AssignmentExpressionNode,
        context: TransformerContext
    ): ESTree.AssignmentExpression {
        return {
            type: "AssignmentExpression",
            left: this.transformExpression(
                node.left,
                context
            ) as ESTree.Pattern,
            right: this.transformExpression(
                node.right,
                context
            ) as ESTree.Expression,
            operator: node.operator as ESTree.AssignmentOperator
        };
    }

    protected transformBinaryExpression(
        node: BinaryExpressionNode,
        context: TransformerContext
    ): ESTree.BinaryExpression {
        return this.transformJSBinaryOperation(
            node.operator,
            this.transformExpression(node.left, context),
            this.transformExpression(node.right, context)
        );
    }

    protected transformUnaryExpression(
        node: UnaryExpressionNode,
        context: TransformerContext
    ): ESTree.UnaryExpression {
        return {
            type: "UnaryExpression",
            argument: this.transformExpression(
                node.operand,
                context
            ) as ESTree.Expression,
            prefix: (node.kind === UnaryExpressionKind.Prefix
                ? true
                : undefined) as true,
            operator: node.operator as ESTree.UnaryExpression["operator"]
        };
    }

    protected transformIdentifier(
        node: IdentifierNode,
        _context: TransformerContext
    ): ESTree.Identifier {
        return {
            type: "Identifier",
            name: node.symbol
        };
    }

    protected transformLiteral(
        node: LiteralNode,
        _context: TransformerContext
    ): ESTree.Literal {
        return {
            type: "Literal",
            value: node.getJSValue()
        };
    }

    protected transformBlockChild(
        node: AbstractNode,
        context: TransformerContext
    ): ESTree.Statement {
        const esNode = this.transformStatement(node, context);

        if (node instanceof ExpressionNode) {
            return {
                type: "ExpressionStatement",
                expression: esNode as ESTree.Expression
            };
        }

        return esNode as ESTree.Statement;
    }

    protected transformRoot(
        node: RootNode,
        context: TransformerContext
    ): ESTree.Program {
        return {
            type: "Program",
            sourceType: "script",
            body: node.children.map(c => this.transformBlockChild(c, context))
        };
    }
}

export default Transformer;
