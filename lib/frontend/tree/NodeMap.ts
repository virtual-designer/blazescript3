import BinaryExpressionNode from "./BinaryExpressionNode.ts";
import CallExpressionNode from "./CallExpressionNode.ts";
import IdentifierNode from "./IdentifierNode.ts";
import LiteralNode from "./LiteralNode.ts";
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
    [NodeType.VariableDeclaration]: VariableDeclarationNode
} as const;

export type NodeMapType = {
    [T in keyof typeof NodeMap]: InstanceType<(typeof NodeMap)[T]>;
};
