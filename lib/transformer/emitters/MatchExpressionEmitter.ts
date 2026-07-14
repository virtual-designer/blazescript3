import ESTree from "estree";
import BinaryOperator from "../../frontend/tree/expressions/BinaryOperator.ts";
import type MatchExpressionCaseNode from "../../frontend/tree/expressions/MatchExpressionCaseNode.ts";
import { MatchExpressionCaseKind } from "../../frontend/tree/expressions/MatchExpressionCaseNode.ts";
import MatchExpressionNode from "../../frontend/tree/expressions/MatchExpressionNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";

class MatchExpressionEmitter extends ESTreeEmitter<
    MatchExpressionNode,
    ESTree.Expression
> {
    public override readonly NODE_TYPE = MatchExpressionNode;

    public override emit(
        node: MatchExpressionNode,
        context: TransformerContext
    ): EmitterResult<ESTree.Expression> {
        const subjectVarName = this.transformer.randomSymbolName("_subject");
        const body: ESTree.Statement[] = [];
        const equalCaseStack: MatchExpressionCaseNode[] = [];
        const previousNodes: ESTree.BaseNode[] = [],
            nextNodes: ESTree.BaseNode[] = [];

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
                    const argument = this.transformer.transformExpression(
                        equalCase.body,
                        context
                    );

                    const consequent: ESTree.Statement = {
                        type: "ReturnStatement",
                        argument: argument.node
                    };

                    const test = this.transformer.transformExpression(
                        equalCase.comparisonTarget!,
                        context
                    );

                    this.combineTo(previousNodes, nextNodes, argument, test);

                    cases.push({
                        type: "SwitchCase",
                        test: test.node,
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
                    const argument = this.transformer.transformExpression(
                        definedCase.body,
                        context
                    );

                    body.push({
                        type: "ReturnStatement",
                        argument: argument.node
                    });

                    this.combineTo(previousNodes, nextNodes, argument);
                    break;

                case MatchExpressionCaseKind.Comparison:
                    {
                        const comparisonTarget =
                            this.transformer.transformExpression(
                                definedCase.comparisonTarget!,
                                context
                            );

                        const argument = this.transformer.transformExpression(
                            definedCase.body,
                            context
                        );

                        let cond: ESTree.Statement = {
                            type: "IfStatement",
                            test: this.transformer.transformJSBinaryOperation(
                                definedCase.comparisonOperator ||
                                    BinaryOperator.Equal,
                                {
                                    type: "Identifier",
                                    name: subjectVarName
                                },
                                comparisonTarget.node
                            ),
                            consequent: {
                                type: "ReturnStatement",
                                argument: argument.node
                            }
                        };

                        this.combineTo(
                            previousNodes,
                            nextNodes,
                            comparisonTarget,
                            argument
                        );

                        if (definedCase.condition) {
                            const test = this.transformer.transformExpression(
                                definedCase.condition,
                                context
                            );

                            this.combineTo(previousNodes, nextNodes, test);

                            cond = {
                                type: "IfStatement",
                                test: test.node,
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

        const subject = this.transformer.transformExpression(
            node.subject,
            context
        );

        this.combineTo(previousNodes, nextNodes, subject);

        return {
            node: {
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
                arguments: [subject.node],
                optional: false
            },
            nextNodes,
            previousNodes
        };
    }
}

export default MatchExpressionEmitter;
