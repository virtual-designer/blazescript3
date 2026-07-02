import NodeType from "../NodeType.ts";
import type IdentifierNode from "./IdentifierNode.ts";

export type AssignmentLValueExpression = IdentifierNode;
export const AssignmentLValueExpressions: NodeType[] = [NodeType.Identifier];
