import ESTree from "estree";
import RangeExpressionNode from "../../frontend/tree/expressions/RangeExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class RangeExpressionEmitter extends ESTreeEmitter<
    RangeExpressionNode,
    ESTree.Expression
> {
    public override readonly NODE_TYPE = RangeExpressionNode;

    public override emit(
        node: RangeExpressionNode,
        context: TransformerContext
    ): ESTree.Expression {
        return {
            type: "CallExpression",
            callee: {
                type: "MemberExpression",
                object: {
                    type: "MemberExpression",
                    object: {
                        type: "Identifier",
                        name: this.transformer.BLAZE_GLOBAL_SYMBOL
                    },
                    property: {
                        type: "Identifier",
                        name: "utils"
                    },
                    computed: false,
                    optional: false
                },
                property: {
                    type: "Identifier",
                    name: "createRangeIterator"
                },
                computed: false,
                optional: false
            },
            arguments: [
                this.transformer.transformExpression(node.from, context),
                this.transformer.transformExpression(node.to, context),
                {
                    type: "Literal",
                    value: node.fromInclusive
                },
                {
                    type: "Literal",
                    value: node.toInclusive
                }
            ],
            optional: false
        };
    }
}

export default RangeExpressionEmitter;
