import type { Diagnostic } from "../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";
import type BaseNode from "../frontend/tree/BaseNode.ts";
import NodeType from "../frontend/tree/NodeType.ts";
import VariableDeclarationKind from "../frontend/tree/VariableDeclarationKind.ts";
import type VariableDeclarationNode from "../frontend/tree/VariableDeclarationNode.ts";

type SyntheticSymbolDefinition = {
    kind: VariableDeclarationKind;
    isInitialized: boolean;
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

                if (scope.symbolTable.has(node.identifier.symbol)) {
                    diagnostics.push({
                        message: "Identifier is already defined",
                        code: DiagnosticCode.IllegalRedefinition,
                        level: DiagnosticLevel.Error,
                        location: node.identifier.location
                    });

                    return;
                }

                scope.symbolTable.set(node.identifier.symbol, {
                    kind: node.kind,
                    isInitialized: !!node.value,
                    hits: -1,
                    node
                });
            },
            [NodeType.Identifier]: node => {
                const symbol = scope.symbolTable.get(node.symbol);

                if (symbol) {
                    symbol.hits++;
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
                }
            }
        });

        return diagnostics;
    }
}

export default SemanticAnalyzer;
