import chalk from "chalk";
import { assert } from "console";
import type { Diagnostic } from "../diagnostic/Diagnostic.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";
import type AbstractNode from "../frontend/tree/AbstractNode.ts";
import { AccessModifier } from "../frontend/tree/declarations/AccessModifier.ts";
import type ClassMethodDeclarationNode from "../frontend/tree/declarations/ClassMethodDeclarationNode.ts";
import type FunctionDeclarationNode from "../frontend/tree/declarations/FunctionDeclarationNode.ts";
import VariableDeclarationKind from "../frontend/tree/declarations/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../frontend/tree/declarations/VariableDeclarationNode.ts";
import type AssignmentExpressionNode from "../frontend/tree/expressions/AssignmentExpressionNode.ts";
import IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import type UnaryExpressionNode from "../frontend/tree/expressions/UnaryExpressionNode.ts";
import UnaryOperator from "../frontend/tree/expressions/UnaryOperator.ts";
import type BlockStatementNode from "../frontend/tree/statements/BlockStatementNode.ts";
import type ForInStatementNode from "../frontend/tree/statements/ForInStatementNode.ts";
import type ForStatementNode from "../frontend/tree/statements/ForStatementNode.ts";
import type ReturnStatementNode from "../frontend/tree/statements/ReturnStatementNode.ts";
import type { TreeVisitor } from "../frontend/tree/TreeVisitor.ts";
import { TreeVisitorInvoker } from "../frontend/tree/TreeVisitorInvoker.ts";
import TypeUtils from "../types/TypeUtils.ts";
import { FunctionSymbol } from "./FunctionSymbol.ts";
import { Scope } from "./Scope.ts";
import { VariableSymbol } from "./VariableSymbol.ts";

type SemanticAnalyzerContext = {
    scope: Scope;
    functionScopeDepth: number;
};

class SemanticAnalyzer implements TreeVisitor<SemanticAnalyzerContext> {
    private readonly diagnostics: Diagnostic[] = [];
    private readonly node: AbstractNode;
    private readonly visitorInvoker: TreeVisitorInvoker;
    private readonly globalScope = new Scope(null);

    public constructor(node: AbstractNode) {
        this.node = node;
        this.visitorInvoker = new TreeVisitorInvoker(this.node);
    }

    public getDiagnostics(): Readonly<typeof this.diagnostics> {
        return this.diagnostics;
    }

    private addDiagnostic(...diagnostics: Diagnostic[]) {
        this.diagnostics.push(...diagnostics);
    }

    private checkIdentifierExistingDefinition(
        identifier: IdentifierNode,
        node: AbstractNode,
        { scope }: SemanticAnalyzerContext
    ) {
        if (scope.symbolTable.has(identifier.symbol)) {
            const symbol = scope.symbolTable.get(identifier.symbol)!;

            this.addDiagnostic({
                message: `Identifier '${identifier.symbol}' is already defined`,
                code: DiagnosticCode.IllegalRedefinition,
                level: DiagnosticLevel.Error,
                location: identifier.location,
                suggestions:
                    symbol instanceof VariableSymbol &&
                    node instanceof VariableDeclarationNode
                        ? symbol.node.kind === node.kind &&
                          !node.annotatedType &&
                          !symbol.node.annotatedType
                            ? []
                            : [
                                  {
                                      message: `Previously defined as '${chalk.blueBright.bold(VariableDeclarationKind[symbol.node.kind.value as unknown as keyof typeof VariableDeclarationKind].toLowerCase())} ${symbol.node.identifier.symbol}${
                                          symbol.node.annotatedType
                                              ? chalk.whiteBright.dim(": ") +
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

            this.addDiagnostic({
                message: `Previous definition of '${identifier.symbol}'`,
                code: DiagnosticCode.IllegalRedefinition,
                level: DiagnosticLevel.Note,
                location: symbol.getSymbolLocation()
            });

            return false;
        }

        return true;
    }

    public analyze() {
        this.visitorInvoker.invoke(
            this as TreeVisitor<SemanticAnalyzerContext>,
            {
                functionScopeDepth: 0,
                scope: this.globalScope
            }
        );

        this.globalScope.traverse(this.traverseScope.bind(this));
    }

    private traverseScope(scope: Scope) {
        for (const [symbolName, symbolDefinition] of scope.symbolTable) {
            if (
                symbolDefinition.hits < 1 &&
                !symbolDefinition.hasExportLinkage()
            ) {
                this.addDiagnostic({
                    message: `'${symbolName}' is never used`,
                    code: DiagnosticCode.Unused,
                    level: DiagnosticLevel.Warning,
                    location: symbolDefinition.getSymbolLocation()
                });
            } else if (
                symbolDefinition instanceof VariableSymbol &&
                !symbolDefinition.isAssigned &&
                symbolDefinition.node.kind.value === VariableDeclarationKind.Let
            ) {
                this.addDiagnostic({
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
    }

    public visitVariableDeclaration(
        node: VariableDeclarationNode,
        context: SemanticAnalyzerContext
    ) {
        if (
            node.kind.value !== VariableDeclarationKind.Let &&
            !node.defaultValue &&
            !node.inline
        ) {
            this.addDiagnostic({
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
            this.addDiagnostic({
                message: `Not enough information to infer type of '${node.identifier.symbol}'`,
                code: DiagnosticCode.UnableToInferType,
                level: DiagnosticLevel.Error,
                location: node.identifier.location,
                suggestions: [
                    {
                        columnOffset: node.identifier.symbol.length,
                        message: "Consider adding a type annotation here"
                    }
                ]
            });
        }

        if (
            !this.checkIdentifierExistingDefinition(
                node.identifier,
                node,
                context
            )
        ) {
            return;
        }

        if (context.scope.parent !== null && node.accessModifier !== null) {
            this.addDiagnostic({
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
            this.addDiagnostic({
                message: `Modifier '${node.accessModifier}' is not applicable for '${node.identifier.symbol}'`,
                code: DiagnosticCode.ModifierNotApplicable,
                level: DiagnosticLevel.Error,
                location: node.accessModifier.location
            });
        }

        const defn = new VariableSymbol(node, false, node.inline ? 1 : -1);
        context.scope.symbolTable.set(node.identifier.symbol, defn);
    }

    public visitIdentifier(
        node: IdentifierNode,
        { scope }: SemanticAnalyzerContext
    ) {
        const symbol = scope.symbolTable.get(node.symbol);

        if (symbol) {
            symbol.incrementHit();
        }
    }

    public visitAssignmentExpression(
        node: AssignmentExpressionNode,
        { scope }: SemanticAnalyzerContext
    ) {
        if (node.left instanceof IdentifierNode) {
            const symbol = scope.symbolTable.get(node.left.symbol);

            if (symbol && symbol instanceof VariableSymbol) {
                if (symbol.kind !== VariableDeclarationKind.Let) {
                    this.addDiagnostic({
                        message: `${symbol.kind} declaration '${symbol.node.identifier.symbol}' cannot be reassigned`,
                        code: DiagnosticCode.IllegalAssignment,
                        level: DiagnosticLevel.Error,
                        location: node.left.location
                    });

                    this.addDiagnostic({
                        message: `Consider using 'let' instead of '${symbol.kind}' for '${symbol.node.identifier.symbol}' to allow reassignment`,
                        code: DiagnosticCode.IllegalAssignment,
                        level: DiagnosticLevel.Note,
                        location: symbol.node.identifier.location
                    });
                }

                symbol.setAssigned(true);
            }
        }
    }

    public visitUnaryExpression(
        node: UnaryExpressionNode,
        { scope }: SemanticAnalyzerContext
    ) {
        if (
            node.operator === UnaryOperator.Increment ||
            node.operator === UnaryOperator.Decrement
        ) {
            if (!(node.operand instanceof IdentifierNode)) {
                this.addDiagnostic({
                    message: `Invalid operand for ${node.kind} unary expression`,
                    code: DiagnosticCode.InvalidUnaryExpressionOperand,
                    level: DiagnosticLevel.Error,
                    location: node.location
                });

                return;
            }

            const symbol = scope.symbolTable.get(node.operand.symbol);

            if (symbol && symbol instanceof VariableSymbol) {
                symbol.setAssigned(true);
            }
        }
    }

    public visitForInStatement(node: ForInStatementNode) {
        if (node.variable.accessModifier !== null) {
            this.addDiagnostic({
                message: `Modifiers are not allowed for '${node.variable.identifier.symbol}'`,
                code: DiagnosticCode.ModifiersNotAllowed,
                level: DiagnosticLevel.Error,
                location: node.variable.accessModifier.location
            });
        }
    }

    public visitForStatement(node: ForStatementNode) {
        if (
            node.init instanceof VariableDeclarationNode &&
            node.init.accessModifier !== null
        ) {
            this.addDiagnostic({
                message: `Modifiers are not allowed for '${node.init.identifier.symbol}'`,
                code: DiagnosticCode.ModifiersNotAllowed,
                level: DiagnosticLevel.Error,
                location: node.init.accessModifier.location
            });
        }
    }

    public visitBlockStatement(
        node: BlockStatementNode,
        context: SemanticAnalyzerContext
    ) {
        let scope = node.getScope();

        if (!scope) {
            const childScope = new Scope(context.scope);
            scope = childScope;
            node.setScope(childScope);
        }

        context.scope = scope;

        return {
            cleanup: () => {
                assert(context.scope === scope);

                if (context.scope.parent) {
                    context.scope = context.scope.parent;
                }
            }
        };
    }

    public visitFunctionDeclaration(
        node: FunctionDeclarationNode,
        context: SemanticAnalyzerContext
    ) {
        context.functionScopeDepth++;

        if (
            !this.checkIdentifierExistingDefinition(
                node.identifier,
                node,
                context
            )
        ) {
            return;
        }

        if (context.scope.parent !== null && node.accessModifier !== null) {
            this.addDiagnostic({
                message: `Modifiers are not allowed for block-scoped identifier '${node.identifier.symbol}'`,
                code: DiagnosticCode.ModifiersNotAllowed,
                level: DiagnosticLevel.Error,
                location: node.accessModifier.location
            });
        }

        const defn = new FunctionSymbol(node, -1);
        context.scope.symbolTable.set(node.identifier.symbol, defn);

        return {
            cleanup: () => {
                context.functionScopeDepth--;
            }
        };
    }

    public visitClassMethodDeclaration(
        _: ClassMethodDeclarationNode,
        context: SemanticAnalyzerContext
    ) {
        context.functionScopeDepth++;

        return {
            cleanup: () => {
                context.functionScopeDepth--;
            }
        };
    }

    public visitReturnStatement(
        node: ReturnStatementNode,
        context: SemanticAnalyzerContext
    ) {
        if (context.functionScopeDepth < 1) {
            this.addDiagnostic({
                message: `Cannot return outside a function`,
                code: DiagnosticCode.InvalidReturn,
                level: DiagnosticLevel.Error,
                location: node.location
            });
        }
    }
}

export default SemanticAnalyzer;
