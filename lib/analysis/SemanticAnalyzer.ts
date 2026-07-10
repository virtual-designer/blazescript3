import chalk from "chalk";
import type { Diagnostic } from "../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import { AccessModifier } from "../frontend/tree/declarations/AccessModifier.ts";
import VariableDeclarationKind from "../frontend/tree/declarations/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../frontend/tree/declarations/VariableDeclarationNode.ts";
import IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import UnaryOperator from "../frontend/tree/expressions/UnaryOperator.ts";
import NodeType from "../frontend/tree/NodeType.ts";
import type { TreeWalker } from "../frontend/tree/TreeWalker.ts";
import TypeUtils from "../types/TypeUtils.ts";
import { FunctionDeclarationSymbolDefinition } from "./FunctionDeclarationSymbolDefinition.ts";
import { Scope } from "./Scope.ts";
import { VariableDeclarationSymbolDefinition } from "./VariableDeclarationSymbolDefinition.ts";

class SemanticAnalyzer {
    private traverseScope(scope: Scope, callback: (scope: Scope) => void) {
        callback(scope);

        for (const childScope of scope.children) {
            this.traverseScope(childScope, callback);
        }
    }

    public analyze(sourceNode: AbstractNode): Diagnostic[] {
        const globalScope = new Scope(null);

        let functionScopeDepth = 0;
        let scope = globalScope;
        const diagnostics: Diagnostic[] = [];

        const checkIdentifierExistingDefn = (
            identifier: IdentifierNode,
            node: AbstractNode
        ) => {
            if (scope.symbolTable.has(identifier.symbol)) {
                const symbol = scope.symbolTable.get(identifier.symbol)!;

                diagnostics.push({
                    message: `Identifier '${identifier.symbol}' is already defined`,
                    code: DiagnosticCode.IllegalRedefinition,
                    level: DiagnosticLevel.Error,
                    location: identifier.location,
                    suggestions:
                        symbol instanceof VariableDeclarationSymbolDefinition &&
                        node instanceof VariableDeclarationNode
                            ? symbol.node.kind === node.kind &&
                              !node.annotatedType &&
                              !symbol.node.annotatedType
                                ? []
                                : [
                                      {
                                          message: `Previously defined as '${chalk.blueBright.bold(VariableDeclarationKind[symbol.node.kind.value as unknown as keyof typeof VariableDeclarationKind].toLowerCase())} ${symbol.node.identifier.symbol}${
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
                            : []
                });

                diagnostics.push({
                    message: `Previous definition of '${identifier.symbol}'`,
                    code: DiagnosticCode.IllegalRedefinition,
                    level: DiagnosticLevel.Note,
                    location: symbol.getSymbolLocation()
                });

                return false;
            }

            return true;
        };

        const walker: Readonly<TreeWalker<AbstractNode>> = {
            [NodeType.VariableDeclaration]: node => {
                if (
                    node.kind.value !== VariableDeclarationKind.Let &&
                    !node.defaultValue &&
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
                    node.kind.value === VariableDeclarationKind.Let &&
                    !node.defaultValue &&
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

                if (!checkIdentifierExistingDefn(node.identifier, node)) {
                    return;
                }

                if (scope.parent !== null && node.accessModifier !== null) {
                    diagnostics.push({
                        message: `Modifiers are not allowed for block-scoped identifier '${node.identifier.symbol}'`,
                        code: DiagnosticCode.ModifiersNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.accessModifier.location
                    });
                } else if (
                    node.accessModifier &&
                    node.accessModifier.value !== AccessModifier.Public &&
                    node.accessModifier.value !== AccessModifier.Private &&
                    node.accessModifier.value !== AccessModifier.Internal
                ) {
                    diagnostics.push({
                        message: `Modifier '${node.accessModifier}' is not applicable for '${node.identifier.symbol}'`,
                        code: DiagnosticCode.ModifierNotApplicable,
                        level: DiagnosticLevel.Error,
                        location: node.accessModifier.location
                    });
                }

                const defn = new VariableDeclarationSymbolDefinition(
                    node,
                    false,
                    node.inline ? 1 : -1
                );

                scope.symbolTable.set(node.identifier.symbol, defn);
            },
            [NodeType.Identifier]: node => {
                const symbol = scope.symbolTable.get(node.symbol);

                if (symbol) {
                    symbol.incrementHit();
                }
            },
            [NodeType.AssignmentExpression]: node => {
                if (node.left instanceof IdentifierNode) {
                    const symbol = scope.symbolTable.get(node.left.symbol);

                    if (
                        symbol &&
                        symbol instanceof VariableDeclarationSymbolDefinition
                    ) {
                        if (symbol.kind !== VariableDeclarationKind.Let) {
                            diagnostics.push({
                                message: `${symbol.kind} declaration '${symbol.node.identifier.symbol}' cannot be reassigned`,
                                code: DiagnosticCode.IllegalAssignment,
                                level: DiagnosticLevel.Error,
                                location: node.left.location
                            });

                            diagnostics.push({
                                message: `Consider using 'let' instead of '${symbol.kind}' for '${symbol.node.identifier.symbol}' to allow reassignment`,
                                code: DiagnosticCode.IllegalAssignment,
                                level: DiagnosticLevel.Note,
                                location: symbol.node.identifier.location
                            });
                        }

                        symbol.setAssigned(true);
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

                    if (
                        symbol &&
                        symbol instanceof VariableDeclarationSymbolDefinition
                    ) {
                        symbol.setAssigned(true);
                    }
                }
            },
            [NodeType.ForInStatement]: node => {
                if (node.variable.accessModifier !== null) {
                    diagnostics.push({
                        message: `Modifiers are not allowed for '${node.variable.identifier.symbol}'`,
                        code: DiagnosticCode.ModifiersNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.variable.accessModifier.location
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
                        code: DiagnosticCode.ModifiersNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.init.accessModifier.location
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
            [NodeType.FunctionDeclaration]: node => {
                functionScopeDepth++;

                if (!checkIdentifierExistingDefn(node.identifier, node)) {
                    return;
                }

                if (scope.parent !== null && node.accessModifier !== null) {
                    diagnostics.push({
                        message: `Modifiers are not allowed for block-scoped identifier '${node.identifier.symbol}'`,
                        code: DiagnosticCode.ModifiersNotAllowed,
                        level: DiagnosticLevel.Error,
                        location: node.accessModifier.location
                    });
                }

                const defn = new FunctionDeclarationSymbolDefinition(node, -1);
                scope.symbolTable.set(node.identifier.symbol, defn);

                return {
                    _cleanup: _ => {
                        functionScopeDepth--;
                    }
                };
            },
            [NodeType.ClassMethodDeclaration]: _node => {
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
        };

        sourceNode.walk(walker);

        this.traverseScope(globalScope, scope => {
            for (const [symbolName, symbolDefinition] of scope.symbolTable) {
                if (
                    symbolDefinition.hits < 1 &&
                    !symbolDefinition.hasExportLinkage()
                ) {
                    diagnostics.push({
                        message: `'${symbolName}' is never used`,
                        code: DiagnosticCode.Unused,
                        level: DiagnosticLevel.Warning,
                        location: symbolDefinition.getSymbolLocation()
                    });
                } else if (
                    symbolDefinition instanceof
                        VariableDeclarationSymbolDefinition &&
                    !symbolDefinition.isAssigned &&
                    symbolDefinition.node.kind.value ===
                        VariableDeclarationKind.Let
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
