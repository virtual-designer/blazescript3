import BinaryExpressionNode from "./BinaryExpressionNode.ts";
import BlockStatementNode from "./BlockStatementNode.ts";
import CallExpressionNode from "./CallExpressionNode.ts";
import EmptyStatementNode from "./EmptyStatementNode.ts";
import ExpressionStatementNode from "./ExpressionStatementNode.ts";
import ForStatementNode from "./ForStatementNode.ts";
import IdentifierNode from "./IdentifierNode.ts";
import IfStatementNode from "./IfStatementNode.ts";
import LiteralNode from "./LiteralNode.ts";
import MatchExpressionCaseNode from "./MatchExpressionCaseNode.ts";
import MatchExpressionNode from "./MatchExpressionNode.ts";
import NodeType from "./NodeType.ts";
import RootNode from "./RootNode.ts";
import UnaryExpressionNode from "./UnaryExpressionNode.ts";
import VariableDeclarationNode from "./VariableDeclarationNode.ts";

export const NodeMap = {
    [NodeType.Root]: RootNode,
    [NodeType.BinaryExpression]: BinaryExpressionNode,
    [NodeType.CallExpression]: CallExpressionNode,
    [NodeType.Identifier]: IdentifierNode,
    [NodeType.Literal]: LiteralNode,
    [NodeType.UnaryExpression]: UnaryExpressionNode,
    [NodeType.VariableDeclaration]: VariableDeclarationNode,
    [NodeType.MatchExpression]: MatchExpressionNode,
    [NodeType.MatchExpressionCase]: MatchExpressionCaseNode,
    [NodeType.IfStatement]: IfStatementNode,
    [NodeType.BlockStatement]: BlockStatementNode,
    [NodeType.ExpressionStatement]: ExpressionStatementNode,
    [NodeType.ForStatement]: ForStatementNode,
    [NodeType.EmptyStatement]: EmptyStatementNode,
} as const;

export type NodeMapType = {
    [T in keyof typeof NodeMap]: InstanceType<(typeof NodeMap)[T]>;
};
