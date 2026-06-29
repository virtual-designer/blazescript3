import type BinaryExpressionNode from "./BinaryExpressionNode.ts";
import type BinaryOperator from "./BinaryOperator.ts";
import type IdentifierNode from "./IdentifierNode.ts";
import type LiteralNode from "./LiteralNode.ts";

export type TypeExpressionNode =
    | LiteralNode
    | IdentifierNode
    | (BinaryExpressionNode & {
          operator: BinaryOperator.Intersection | BinaryOperator.Union;
      });
