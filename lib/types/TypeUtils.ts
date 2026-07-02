import type ExpressionNode from "../frontend/tree/ExpressionNode.ts";
import BinaryExpressionNode from "../frontend/tree/expressions/BinaryExpressionNode.ts";
import IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";

class TypeUtils {
    public static stringifyExpressionNode(expression: ExpressionNode): string {
        if (expression instanceof BinaryExpressionNode) {
            return `${this.stringifyExpressionNode(expression.left)} ${expression.operator} ${this.stringifyExpressionNode(expression.right)}`;
        }

        if (expression instanceof IdentifierNode) {
            return expression.symbol;
        }

        throw new TypeError("Invalid expression");
    }
}

export default TypeUtils;
