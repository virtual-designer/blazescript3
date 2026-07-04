import ESTree from "estree";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import type DeclarationNode from "../frontend/tree/DeclarationNode.ts";
import ExpressionNode from "../frontend/tree/ExpressionNode.ts";
import BinaryOperator from "../frontend/tree/expressions/BinaryOperator.ts";
import StatementNode from "../frontend/tree/StatementNode.ts";
import ExpressionStatementNode from "../frontend/tree/statements/ExpressionStatementNode.ts";
import AssignmentExpressionEmitter from "./emitters/AssignmentExpressionEmitter.ts";
import AwaitExpressionEmitter from "./emitters/AwaitExpressionEmitter.ts";
import BinaryExpressionEmitter from "./emitters/BinaryExpressionEmitter.ts";
import BlockStatementEmitter from "./emitters/BlockStatementEmitter.ts";
import CallExpressionEmitter from "./emitters/CallExpressionEmitter.ts";
import EmptyStatementEmitter from "./emitters/EmptyStatementEmitter.ts";
import ExpressionStatementEmitter from "./emitters/ExpressionStatementEmitter.ts";
import ForInStatementEmitter from "./emitters/ForInStatementEmitter.ts";
import ForStatementEmitter from "./emitters/ForStatementEmitter.ts";
import FunctionDeclarationEmitter from "./emitters/FunctionDeclarationEmitter.ts";
import IdentifierEmitter from "./emitters/IdentifierEmitter.ts";
import IfStatementEmitter from "./emitters/IfStatementEmitter.ts";
import ImportStatementEmitter from "./emitters/ImportStatementEmitter.ts";
import LiteralEmitter from "./emitters/LiteralEmitter.ts";
import MatchExpressionEmitter from "./emitters/MatchExpressionEmitter.ts";
import RangeExpressionEmitter from "./emitters/RangeExpressionEmitter.ts";
import ReturnStatementEmitter from "./emitters/ReturnStatementEmitter.ts";
import RootEmitter from "./emitters/RootEmitter.ts";
import UnaryExpressionEmitter from "./emitters/UnaryExpressionEmitter.ts";
import VariableDeclarationEmitter from "./emitters/VariableDeclarationEmitter.ts";
import WhileStatementEmitter from "./emitters/WhileStatementEmitter.ts";
import type { ESTreeEmitter } from "./ESTreeEmitter.ts";
import type { TransformerContext } from "./TransformerContext.ts";

type EmitterClass = new (
    transformer: NodeTransformer
) => ESTreeEmitter<AbstractNode, ESTree.BaseNode>;

class NodeTransformer {
    private static readonly EMITTER_CLASSES = [
        AssignmentExpressionEmitter,
        AwaitExpressionEmitter,
        BinaryExpressionEmitter,
        BlockStatementEmitter,
        ExpressionStatementEmitter,
        CallExpressionEmitter,
        EmptyStatementEmitter,
        ForInStatementEmitter,
        ForStatementEmitter,
        FunctionDeclarationEmitter,
        IdentifierEmitter,
        IfStatementEmitter,
        ImportStatementEmitter,
        LiteralEmitter,
        MatchExpressionEmitter,
        RangeExpressionEmitter,
        ReturnStatementEmitter,
        RootEmitter,
        UnaryExpressionEmitter,
        VariableDeclarationEmitter,
        WhileStatementEmitter
    ];

    private readonly emitterMap = new Map<
        EmitterClass,
        ESTreeEmitter<AbstractNode, ESTree.BaseNode>
    >();

    private readonly emitterMapByNode = new Map<
        new (...args: never[]) => AbstractNode,
        ESTreeEmitter<AbstractNode, ESTree.BaseNode>
    >();

    public readonly BLAZE_GLOBAL_SYMBOL = "__blaze";

    public constructor() {
        for (const emitterClass of NodeTransformer.EMITTER_CLASSES) {
            this.registerEmitter(emitterClass);
        }
    }

    public randomSymbolName(suffix: string, prefix: string = "") {
        const rand = Math.floor(Math.random() * 10000);
        return `t${prefix}${rand}${suffix}`;
    }

    public registerEmitter(emitterClass: EmitterClass) {
        const emitterObject = new emitterClass(this);
        this.emitterMap.set(emitterClass, emitterObject);
        this.emitterMapByNode.set(emitterObject.NODE_TYPE, emitterObject);
    }

    public getEmitter<E extends EmitterClass>(
        emitterClass: E
    ): InstanceType<E> {
        const emitter = this.emitterMap.get(emitterClass);

        if (!emitter) {
            throw new Error(`Emitter not found: ${emitterClass.name}`);
        }

        return emitter as InstanceType<E>;
    }

    public getEmitterByNodeType(
        nodeType: new (...args: never[]) => AbstractNode
    ) {
        const emitter = this.emitterMapByNode.get(nodeType);

        if (!emitter) {
            throw new Error(`Emitter not found for node: ${nodeType.name}`);
        }

        return emitter;
    }

    public getEmitterByNode(node: AbstractNode) {
        return this.getEmitterByNodeType(
            node.constructor as new (...args: never[]) => AbstractNode
        );
    }

    public transform(node: AbstractNode, context: TransformerContext) {
        if (node instanceof StatementNode) {
            return this.transformStatement(node, context);
        }

        if (node instanceof ExpressionNode) {
            return this.transformExpression(node, context);
        }

        throw new Error("Unsupported node");
    }

    public transformStatement(
        node: StatementNode | DeclarationNode,
        context: TransformerContext
    ): ESTree.Statement {
        const emitter = this.getEmitterByNode(node);

        if (node instanceof ExpressionNode) {
            return {
                type: "ExpressionStatement",
                expression: this.transformExpression(
                    node instanceof ExpressionStatementNode
                        ? node.expression
                        : node,
                    context
                )
            } satisfies ESTree.ExpressionStatement;
        }

        return emitter.emit(node, context) as ESTree.Statement;
    }

    public transformExpression(
        node: ExpressionNode,
        context: TransformerContext
    ): ESTree.Expression {
        const emitter = this.getEmitterByNode(node);
        return emitter.emit(node, context) as ESTree.Expression;
    }

    public transformJSBinaryOperation(
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

    public exportDeclaration(
        node: ESTree.Declaration
    ): ESTree.ExportNamedDeclaration {
        return {
            type: "ExportNamedDeclaration",
            declaration: node,
            specifiers: [],
            attributes: []
        };
    }

    public transformBlockChild(
        node: AbstractNode,
        context: TransformerContext
    ): ESTree.Statement {
        const esNode = this.transformStatement(node, context);
        return esNode;
    }
}

export default NodeTransformer;
