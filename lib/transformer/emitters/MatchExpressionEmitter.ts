import ESTree from "estree";
import BinaryOperator from "../../frontend/tree/expressions/BinaryOperator.ts";
import type MatchExpressionCaseNode from "../../frontend/tree/expressions/MatchExpressionCaseNode.ts";
import { MatchExpressionCaseKind } from "../../frontend/tree/expressions/MatchExpressionCaseNode.ts";
import MatchExpressionNode from "../../frontend/tree/expressions/MatchExpressionNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";

class MatchExpressionEmitter extends ESTreeEmitter<
    MatchExpressionNode,
    ESTree.Expression
> {
    public override readonly NODE_TYPE = MatchExpressionNode;

    public override emit(
        node: MatchExpressionNode,
        context: TransformerContext
    ): ESTree.Expression {
        const subjectVarName = this.transformer.randomSymbolName("_subject");
        const body: ESTree.Statement[] = [];
        const equalCaseStack: MatchExpressionCaseNode[] = [];

        for (const definedCase of node.cases) {
            if (
                definedCase.kind === MatchExpressionCaseKind.Comparison &&
                definedCase.comparisonOperator === BinaryOperator.Equal &&
                definedCase.comparisonTarget &&
                !definedCase.condition
            ) {
                equalCaseStack.push(definedCase);
                continue;
            }

            if (equalCaseStack.length) {
                const cases: ESTree.SwitchCase[] = [];

                for (const equalCase of equalCaseStack) {
                    const consequent: ESTree.Statement = {
                        type: "ReturnStatement",
                        argument: this.transformer.transformExpression(
                            equalCase.body,
                            context
                        )
                    };

                    cases.push({
                        type: "SwitchCase",
                        test: this.transformer.transformExpression(
                            equalCase.comparisonTarget!,
                            context
                        ),
                        consequent: [consequent]
                    });
                }

                body.push({
                    type: "SwitchStatement",
                    discriminant: {
                        type: "Identifier",
                        name: subjectVarName
                    },
                    cases
                });

                equalCaseStack.length = 0;
            }

            switch (definedCase.kind) {
                case MatchExpressionCaseKind.Default:
                    body.push({
                        type: "ReturnStatement",
                        argument: this.transformer.transformExpression(
                            definedCase.body,
                            context
                        )
                    });

                    break;

                case MatchExpressionCaseKind.Comparison:
                    {
                        let cond: ESTree.Statement = {
                            type: "IfStatement",
                            test: this.transformer.transformJSBinaryOperation(
                                definedCase.comparisonOperator ||
                                    BinaryOperator.Equal,
                                {
                                    type: "Identifier",
                                    name: subjectVarName
                                },
                                this.transformer.transformExpression(
                                    definedCase.comparisonTarget!,
                                    context
                                )
                            ),
                            consequent: {
                                type: "ReturnStatement",
                                argument: this.transformer.transformExpression(
                                    definedCase.body,
                                    context
                                )
                            }
                        };

                        if (definedCase.condition) {
                            cond = {
                                type: "IfStatement",
                                test: this.transformer.transformExpression(
                                    definedCase.condition,
                                    context
                                ),
                                consequent: cond
                            };
                        }

                        body.push(cond);
                    }

                    break;

                default:
                    throw new Error("Unsupported match case");
            }
        }

        return {
            type: "CallExpression",
            callee: {
                type: "ArrowFunctionExpression",
                params: [
                    {
                        type: "Identifier",
                        name: subjectVarName
                    }
                ],
                expression: false,
                body: {
                    type: "BlockStatement",
                    body
                }
            },
            arguments: [
                this.transformer.transformExpression(node.subject, context)
            ],
            optional: false
        };
    }
}

export default MatchExpressionEmitter;
