import AwaitExpressionNode from "./AwaitExpressionNode.ts";
import BinaryExpressionNode from "./BinaryExpressionNode.ts";
import BlockStatementNode from "./BlockStatementNode.ts";
import CallExpressionNode from "./CallExpressionNode.ts";
import EmptyStatementNode from "./EmptyStatementNode.ts";
import ExpressionStatementNode from "./ExpressionStatementNode.ts";
import ForInStatementNode from "./ForInStatementNode.ts";
import ForStatementNode from "./ForStatementNode.ts";
import FunctionDeclarationNode from "./FunctionDeclarationNode.ts";
import FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";
import IdentifierNode from "./IdentifierNode.ts";
import IfStatementNode from "./IfStatementNode.ts";
import LiteralNode from "./LiteralNode.ts";
import MatchExpressionCaseNode from "./MatchExpressionCaseNode.ts";
import MatchExpressionNode from "./MatchExpressionNode.ts";
import NodeType from "./NodeType.ts";
import RangeExpressionNode from "./RangeExpressionNode.ts";
import ReturnStatementNode from "./ReturnStatementNode.ts";
import RootNode from "./RootNode.ts";
import UnaryExpressionNode from "./UnaryExpressionNode.ts";
import VariableDeclarationNode from "./VariableDeclarationNode.ts";
import WhileStatementNode from "./WhileStatementNode.ts";

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
    [NodeType.WhileStatement]: WhileStatementNode,
    [NodeType.ForInStatement]: ForInStatementNode,
    [NodeType.RangeExpression]: RangeExpressionNode,
    [NodeType.FunctionDeclaration]: FunctionDeclarationNode,
    [NodeType.FunctionParameterDeclaration]: FunctionParameterDeclarationNode,
    [NodeType.AwaitExpression]: AwaitExpressionNode,
    [NodeType.ReturnStatement]: ReturnStatementNode
} as const;

export type NodeMapType = {
    [T in keyof typeof NodeMap]: InstanceType<(typeof NodeMap)[T]>;
};
