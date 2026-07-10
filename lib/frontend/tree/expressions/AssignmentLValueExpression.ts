import NodeType from "../NodeType.ts";
import type IdentifierNode from "./IdentifierNode.ts";
import type MemberAccessExpressionNode from "./MemberAccessExpressionNode.ts";

export type AssignmentLValueExpression =
    | IdentifierNode
    | MemberAccessExpressionNode;

export const AssignmentLValueExpressions: NodeType[] = [
    NodeType.Identifier,
    NodeType.MemberAccessExpression
];
