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
import { AssignmentOperators } from "../frontend/tree/BinaryOperator.ts";
import ExpressionNode from "../frontend/tree/ExpressionNode.ts";

class Transformer {
    public transform(node: BaseNode): ESTree.BaseNode {
        switch (node.type) {
            case NodeType.Root:
                return this.transformRoot(node as RootNode);

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

            case NodeType.VariableDeclaration:
                return this.transformVariableDeclaration(
                    node as VariableDeclarationNode
                );

            default:
                throw new Error(`Unsupported node: ${node}`);
        }
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
                        ? (this.transform(node.value) as ESTree.Expression)
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
                left: this.transform(node.left) as ESTree.Pattern,
                right: this.transform(node.right) as ESTree.Expression,
                operator: node.operator as ESTree.AssignmentOperator
            };
        }

        return {
            type: "BinaryExpression",
            left: this.transform(node.left) as ESTree.Expression,
            right: this.transform(node.right) as ESTree.Expression,
            operator: node.operator as ESTree.BinaryOperator
        };
    }

    protected transformUnaryExpression(
        node: UnaryExpressionNode
    ): ESTree.UnaryExpression {
        return {
            type: "UnaryExpression",
            argument: this.transform(node.operand) as ESTree.Expression,
            prefix: true,
            operator: node.operator
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
            raw: node.value,
            value: node.getJSValue()
        };
    }

    protected transformBlockChild(node: BaseNode): ESTree.Statement {
        const esNode = this.transform(node);

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
