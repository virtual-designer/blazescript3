import chalk from "chalk";
import type { Diagnostic } from "../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import IdentifierNode from "../frontend/tree/IdentifierNode.ts";
import NodeType from "../frontend/tree/NodeType.ts";
import UnaryOperator from "../frontend/tree/UnaryOperator.ts";
import VariableDeclarationKind from "../frontend/tree/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../frontend/tree/VariableDeclarationNode.ts";
import TypeUtils from "../types/TypeUtils.ts";

type SyntheticSymbolDefinition = {
    kind: VariableDeclarationKind;
    isInitialized: boolean;
    isAssigned: boolean;
    hits: number;
    node: VariableDeclarationNode;
};

type SyntheticScope = {
    symbolTable: Map<string, SyntheticSymbolDefinition>;
    parent: SyntheticScope | null;
    children: Set<SyntheticScope>;
};

class SemanticAnalyzer {
    private traverseScope(
        scope: SyntheticScope,
        callback: (scope: SyntheticScope) => void
    ) {
        callback(scope);

        for (const childScope of scope.children) {
            this.traverseScope(childScope, callback);
        }
    }

    public analyze(sourceNode: AbstractNode): Diagnostic[] {
        const globalScope: SyntheticScope = {
            symbolTable: new Map(),
            parent: null,
            children: new Set()
        };

        let functionScopeDepth = 0;
        let scope = globalScope;
        const diagnostics: Diagnostic[] = [];

        sourceNode.walk({
            [NodeType.VariableDeclaration]: node => {
                if (
                    node.kind !== VariableDeclarationKind.Let &&
                    !node.value &&
                    !node.inline
                ) {
                    diagnostics.push({
                        message: `'${node.identifier.symbol}' must be initialized`,
                        code: DiagnosticCode.InitializationRequired,
                        level: DiagnosticLevel.Error,
                        location: node.identifier.location
                    });
                }

                if (
                    node.kind === VariableDeclarationKind.Let &&
                    !node.value &&
                    !node.annotatedType &&
                    !node.inline
                ) {
                    diagnostics.push({
                        message: `Not enough information to infer type of '${node.identifier.symbol}'`,
                        code: DiagnosticCode.UnableToInferType,
                        level: DiagnosticLevel.Error,
                        location: node.identifier.location,
                        suggestions: [
                            {
                                columnOffset: node.identifier.symbol.length,
                                message:
                                    "Consider adding a type annotation here"
                            }
                        ]
                    });
                }

                if (scope.symbolTable.has(node.identifier.symbol)) {
                    const symbol = scope.symbolTable.get(
                        node.identifier.symbol
                    )!;

                    diagnostics.push({
                        message: "Identifier is already defined",
                        code: DiagnosticCode.IllegalRedefinition,
                        level: DiagnosticLevel.Error,
                        location: node.identifier.location,
                        suggestions:
                            symbol.node.kind === node.kind &&
                            !node.annotatedType &&
                            !symbol.node.annotatedType
                                ? []
                                : [
                                      {
                                          message: `Previously defined as '${chalk.blueBright.bold(VariableDeclarationKind[symbol.node.kind].toLowerCase())} ${symbol.node.identifier.symbol}${
                                              symbol.node.annotatedType
                                                  ? chalk.whiteBright.dim(
                                                        ": "
                                                    ) +
                                                    chalk.green(
                                                        TypeUtils.stringifyExpressionNode(
                                                            symbol.node
                                                                .annotatedType
                                                        )
                                                    )
                                                  : ""
                                          }'`
                                      }
                                  ]
                    });

                    return;
                }

                if (scope.parent !== null && node.accessModifier !== null) {
                    diagnostics.push({
                        message: `Modifiers are not allowed for block-scoped identifier '${node.identifier.symbol}'`,
                        code: DiagnosticCode.ModifierNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.location
                    });
                }

                scope.symbolTable.set(node.identifier.symbol, {
                    kind: node.kind,
                    isInitialized: !!node.value,
                    isAssigned: false,
                    hits: node.inline ? 1 : -1,
                    node
                });
            },
            [NodeType.Identifier]: node => {
                const symbol = scope.symbolTable.get(node.symbol);

                if (symbol) {
                    symbol.hits++;
                }
            },
            [NodeType.BinaryExpression]: node => {
                if (
                    node.isAssignment() &&
                    node.left instanceof IdentifierNode
                ) {
                    const symbol = scope.symbolTable.get(node.left.symbol);

                    if (symbol) {
                        symbol.isAssigned = true;
                    }
                }
            },
            [NodeType.UnaryExpression]: node => {
                if (
                    node.operator === UnaryOperator.Increment ||
                    node.operator === UnaryOperator.Decrement
                ) {
                    if (!(node.operand instanceof IdentifierNode)) {
                        diagnostics.push({
                            message: `Invalid operand for ${node.kind} unary expression`,
                            code: DiagnosticCode.InvalidUnaryExpressionOperand,
                            level: DiagnosticLevel.Error,
                            location: node.location
                        });

                        return;
                    }

                    const symbol = scope.symbolTable.get(node.operand.symbol);

                    if (symbol) {
                        symbol.isAssigned = true;
                    }
                }
            },
            [NodeType.ForInStatement]: node => {
                if (node.variable.accessModifier !== null) {
                    diagnostics.push({
                        message: `Modifiers are not allowed for '${node.variable.identifier.symbol}'`,
                        code: DiagnosticCode.ModifierNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.variable.location
                    });
                }
            },
            [NodeType.ForStatement]: node => {
                if (
                    node.init instanceof VariableDeclarationNode &&
                    node.init.accessModifier !== null
                ) {
                    diagnostics.push({
                        message: `Modifiers are not allowed for '${node.init.identifier.symbol}'`,
                        code: DiagnosticCode.ModifierNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.init.location
                    });
                }
            },
            [NodeType.BlockStatement]: _ => {
                scope = {
                    symbolTable: new Map(),
                    parent: scope,
                    children: new Set()
                };

                scope.parent?.children.add(scope);

                return {
                    _cleanup: _ => {
                        scope.parent?.children.delete(scope);

                        if (scope.parent) {
                            scope = scope.parent;
                        }
                    }
                };
            },
            [NodeType.FunctionDeclaration]: _ => {
                functionScopeDepth++;

                return {
                    _cleanup: _ => {
                        functionScopeDepth--;
                    }
                };
            },
            [NodeType.ReturnStatement]: node => {
                if (functionScopeDepth < 1) {
                    diagnostics.push({
                        message: `Cannot return outside a function`,
                        code: DiagnosticCode.InvalidReturn,
                        level: DiagnosticLevel.Error,
                        location: node.location
                    });
                }
            }
        });

        this.traverseScope(globalScope, scope => {
            for (const [symbolName, symbolDefinition] of scope.symbolTable) {
                if (symbolDefinition.hits < 1) {
                    diagnostics.push({
                        message: `'${symbolName}' is never used`,
                        code: DiagnosticCode.Unused,
                        level: DiagnosticLevel.Warning,
                        location: symbolDefinition.node.identifier.location
                    });
                } else if (
                    !symbolDefinition.isAssigned &&
                    symbolDefinition.node.kind === VariableDeclarationKind.Let
                ) {
                    diagnostics.push({
                        message: `let '${symbolName}' is never reassigned`,
                        code: DiagnosticCode.ReadonlyVariable,
                        level: DiagnosticLevel.Warning,
                        location: symbolDefinition.node.identifier.location,
                        suggestions: [
                            {
                                columnOffset:
                                    symbolDefinition.node.location.start[1] -
                                    symbolDefinition.node.identifier.location
                                        .start[1],
                                message: `Consider using 'final'`
                            }
                        ]
                    });
                }
            }
        });

        return diagnostics;
    }
}

export default SemanticAnalyzer;
