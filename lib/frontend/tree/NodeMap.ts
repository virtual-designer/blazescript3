import ClassDeclarationNode from "./declarations/ClassDeclarationNode.ts";
import FunctionDeclarationNode from "./declarations/FunctionDeclarationNode.ts";
import FunctionParameterDeclarationNode from "./declarations/FunctionParameterDeclarationNode.ts";
import VariableDeclarationNode from "./declarations/VariableDeclarationNode.ts";
import AssignmentExpressionNode from "./expressions/AssignmentExpressionNode.ts";
import AwaitExpressionNode from "./expressions/AwaitExpressionNode.ts";
import BinaryExpressionNode from "./expressions/BinaryExpressionNode.ts";
import CallExpressionNode from "./expressions/CallExpressionNode.ts";
import IdentifierNode from "./expressions/IdentifierNode.ts";
import LiteralNode from "./expressions/LiteralNode.ts";
import MatchExpressionCaseNode from "./expressions/MatchExpressionCaseNode.ts";
import MatchExpressionNode from "./expressions/MatchExpressionNode.ts";
import RangeExpressionNode from "./expressions/RangeExpressionNode.ts";
import UnaryExpressionNode from "./expressions/UnaryExpressionNode.ts";
import NodeType from "./NodeType.ts";
import RootNode from "./RootNode.ts";
import BlockStatementNode from "./statements/BlockStatementNode.ts";
import EmptyStatementNode from "./statements/EmptyStatementNode.ts";
import ExpressionStatementNode from "./statements/ExpressionStatementNode.ts";
import ForInStatementNode from "./statements/ForInStatementNode.ts";
import ForStatementNode from "./statements/ForStatementNode.ts";
import IfStatementNode from "./statements/IfStatementNode.ts";
import ImportStatementNode from "./statements/ImportStatementNode.ts";
import ReturnStatementNode from "./statements/ReturnStatementNode.ts";
import WhileStatementNode from "./statements/WhileStatementNode.ts";

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
    [NodeType.ReturnStatement]: ReturnStatementNode,
    [NodeType.ImportStatement]: ImportStatementNode,
    [NodeType.AssignmentExpression]: AssignmentExpressionNode,
    [NodeType.ClassDeclaration]: ClassDeclarationNode
} as const;

export type NodeMapType = {
    [T in keyof typeof NodeMap]: InstanceType<(typeof NodeMap)[T]>;
};
