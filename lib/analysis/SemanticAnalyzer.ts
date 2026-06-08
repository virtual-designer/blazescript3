import chalk from "chalk";
import type { Diagnostic } from "../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";
import type BaseNode from "../frontend/tree/BaseNode.ts";
import NodeType from "../frontend/tree/NodeType.ts";
import VariableDeclarationKind from "../frontend/tree/VariableDeclarationKind.ts";
import type VariableDeclarationNode from "../frontend/tree/VariableDeclarationNode.ts";
import TypeUtils from "../types/TypeUtils.ts";
import IdentifierNode from "../frontend/tree/IdentifierNode.ts";

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
    children: SyntheticScope[];
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

    public analyze(sourceNode: BaseNode): Diagnostic[] {
        const globalScope: SyntheticScope = {
            symbolTable: new Map(),
            parent: null,
            children: []
        };

        let scope = globalScope;
        const diagnostics: Diagnostic[] = [];

        sourceNode.walk({
            [NodeType.VariableDeclaration]: node => {
                if (node.kind !== VariableDeclarationKind.Let && !node.value) {
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
                    !node.annotatedType
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

                scope.symbolTable.set(node.identifier.symbol, {
                    kind: node.kind,
                    isInitialized: !!node.value,
                    isAssigned: false,
                    hits: -1,
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
                                columnOffset: symbolDefinition.node.location.start[1] - symbolDefinition.node.identifier.location.start[1],
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
