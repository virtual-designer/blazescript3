import type BaseNode from "../frontend/tree/BaseNode.ts";
import type IdentifierNode from "../frontend/tree/IdentifierNode.ts";
import type LiteralNode from "../frontend/tree/LiteralNode.ts";
import NodeType from "../frontend/tree/NodeType.ts";
import type RootNode from "../frontend/tree/RootNode.ts";
import ESTree from "estree";
import type VariableDeclarationNode from "../frontend/tree/VariableDeclarationNode.ts";
import VariableDeclarationKind from "../frontend/tree/VariableDeclarationKind.ts";
import type BinaryExpressionNode from "../frontend/tree/BinaryExpressionNode.ts";
import type UnaryExpressionNode from "../frontend/tree/UnaryExpressionNode.ts";
import BinaryOperator, {
    AssignmentOperators
} from "../frontend/tree/BinaryOperator.ts";
import ExpressionNode from "../frontend/tree/ExpressionNode.ts";
import type CallExpressionNode from "../frontend/tree/CallExpressionNode.ts";
import type MatchExpressionNode from "../frontend/tree/MatchExpressionNode.ts";
import type MatchExpressionCaseNode from "../frontend/tree/MatchExpressionCaseNode.ts";
import { MatchExpressionCaseKind } from "../frontend/tree/MatchExpressionCaseNode.ts";
import type IfStatementNode from "../frontend/tree/IfStatementNode.ts";
import type BlockStatementNode from "../frontend/tree/BlockStatementNode.ts";
import ExpressionStatementNode from "../frontend/tree/ExpressionStatementNode.ts";
import type ForStatementNode from "../frontend/tree/ForStatementNode.ts";
import { UnaryExpressionKind } from "../frontend/tree/UnaryExpressionKind.ts";

class Transformer {
    private random(suffix: string, prefix: string = "") {
        const rand = Math.floor(Math.random() * 10000);
        return `t${prefix}${rand}${suffix}`;
    }

    public transformStatement(node: BaseNode): ESTree.BaseNode {
        switch (node.type) {
            case NodeType.Root:
                return this.transformRoot(node as RootNode);

            case NodeType.VariableDeclaration:
                return this.transformVariableDeclaration(
                    node as VariableDeclarationNode
                );

            case NodeType.IfStatement:
                return this.transformIfStatement(node as IfStatementNode);

            case NodeType.ForStatement:
                return this.transformForStatement(node as ForStatementNode);

            case NodeType.BlockStatement:
                return this.transformBlockStatement(node as BlockStatementNode);

            case NodeType.EmptyStatement:
                return { type: "EmptyStatement" };

            default:
                return {
                    type: "ExpressionStatement",
                    expression: this.transformExpression(
                        node instanceof ExpressionStatementNode
                            ? node.expression
                            : node
                    )
                } satisfies ESTree.ExpressionStatement as ESTree.BaseNode;
        }
    }

    public transformExpression(node: BaseNode): ESTree.Expression {
        switch (node.type) {
            case NodeType.Literal:
                return this.transformLiteral(node as LiteralNode);

            case NodeType.Identifier:
                return this.transformIdentifier(node as IdentifierNode);

            case NodeType.UnaryExpression:
                return this.transformUnaryExpression(
                    node as UnaryExpressionNode
                );

            case NodeType.BinaryExpression:
                return this.transformBinaryExpression(
                    node as BinaryExpressionNode
                );

            case NodeType.CallExpression:
                return this.transformCallExpression(node as CallExpressionNode);

            case NodeType.MatchExpression:
                return this.transformMatchExpression(
                    node as MatchExpressionNode
                );

            default:
                throw new Error(`Unsupported node: ${node}`);
        }
    }

    protected transformBlockStatement(
        node: BlockStatementNode
    ): ESTree.BlockStatement {
        return {
            type: "BlockStatement",
            body: node.children.map(this.transformBlockChild.bind(this))
        };
    }

    protected transformForStatement(
        node: ForStatementNode
    ): ESTree.ForStatement {
        return {
            type: "ForStatement",
            init: node.init
                ? (this.transformStatement(node.init) as ESTree.ChainExpression)
                : undefined,
            test: node.condition
                ? this.transformExpression(node.condition)
                : undefined,
            update: node.mutator
                ? this.transformExpression(node.mutator)
                : undefined,
            body: this.transformStatement(node.body) as ESTree.Statement
        };
    }

    protected transformIfStatement(node: IfStatementNode): ESTree.IfStatement {
        return {
            type: "IfStatement",
            test: this.transformExpression(node.condition),
            consequent: this.transformStatement(
                node.thenBlock
            ) as ESTree.Statement,
            alternate: node.elseBlock
                ? (this.transformStatement(node.elseBlock) as ESTree.Statement)
                : undefined
        };
    }

    protected transformMatchExpression(
        node: MatchExpressionNode
    ): ESTree.Expression {
        const subjectVarName = this.random("_subject");
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
                        argument: this.transformExpression(equalCase.body)
                    };

                    cases.push({
                        type: "SwitchCase",
                        test: this.transformExpression(
                            equalCase.comparisonTarget!
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
                        argument: this.transformExpression(definedCase.body)
                    });

                    break;

                case MatchExpressionCaseKind.Comparison:
                    {
                        let cond: ESTree.Statement = {
                            type: "IfStatement",
                            test: {
                                type: "BinaryExpression",
                                left: {
                                    type: "Identifier",
                                    name: subjectVarName
                                },
                                operator:
                                    definedCase.comparisonOperator || "==",
                                right: this.transformExpression(
                                    definedCase.comparisonTarget!
                                )
                            },
                            consequent: {
                                type: "ReturnStatement",
                                argument: this.transformExpression(
                                    definedCase.body
                                )
                            }
                        };

                        if (definedCase.condition) {
                            cond = {
                                type: "IfStatement",
                                test: this.transformExpression(
                                    definedCase.condition
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
            arguments: [this.transformExpression(node.subject)],
            optional: false
        };
    }

    protected transformCallExpression(
        node: CallExpressionNode
    ): ESTree.CallExpression {
        return {
            type: "CallExpression",
            callee: this.transformExpression(node.callee),
            arguments: node.args.map(arg => this.transformExpression(arg)),
            optional: false
        };
    }

    protected transformVariableDeclaration(
        node: VariableDeclarationNode
    ): ESTree.VariableDeclaration {
        return {
            type: "VariableDeclaration",
            kind: node.kind === VariableDeclarationKind.Let ? "let" : "const",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: this.transformIdentifier(node.identifier),
                    init: node.value
                        ? (this.transformExpression(
                              node.value
                          ) as ESTree.Expression)
                        : undefined
                }
            ]
        };
    }

    protected transformBinaryExpression(
        node: BinaryExpressionNode
    ): ESTree.BinaryExpression | ESTree.AssignmentExpression {
        if (AssignmentOperators.includes(node.operator)) {
            return {
                type: "AssignmentExpression",
                left: this.transformExpression(node.left) as ESTree.Pattern,
                right: this.transformExpression(
                    node.right
                ) as ESTree.Expression,
                operator: node.operator as ESTree.AssignmentOperator
            };
        }

        return {
            type: "BinaryExpression",
            left: this.transformExpression(node.left) as ESTree.Expression,
            right: this.transformExpression(node.right) as ESTree.Expression,
            operator: node.operator as ESTree.BinaryOperator
        };
    }

    protected transformUnaryExpression(
        node: UnaryExpressionNode
    ): ESTree.UnaryExpression {
        return {
            type: "UnaryExpression",
            argument: this.transformExpression(
                node.operand
            ) as ESTree.Expression,
            prefix: (node.kind === UnaryExpressionKind.Prefix
                ? true
                : undefined) as true,
            operator: node.operator as ESTree.UnaryExpression["operator"]
        };
    }

    protected transformIdentifier(node: IdentifierNode): ESTree.Identifier {
        return {
            type: "Identifier",
            name: node.symbol
        };
    }

    protected transformLiteral(node: LiteralNode): ESTree.Literal {
        return {
            type: "Literal",
            value: node.getJSValue()
        };
    }

    protected transformBlockChild(node: BaseNode): ESTree.Statement {
        const esNode = this.transformStatement(node);

        if (node instanceof ExpressionNode) {
            return {
                type: "ExpressionStatement",
                expression: esNode as ESTree.Expression
            };
        }

        return esNode as ESTree.Statement;
    }

    protected transformRoot(node: RootNode): ESTree.Program {
        return {
            type: "Program",
            sourceType: "script",
            body: node.children.map(this.transformBlockChild.bind(this))
        };
    }
}

export default Transformer;
