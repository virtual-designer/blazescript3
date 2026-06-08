import BinaryExpressionNode from "../frontend/tree/BinaryExpressionNode.ts";
import type ExpressionNode from "../frontend/tree/ExpressionNode.ts";
import IdentifierNode from "../frontend/tree/IdentifierNode.ts";

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
