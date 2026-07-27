import { AccessModifier } from "../frontend/tree/declarations/AccessModifier.ts";
import type ClassDeclarationNode from "../frontend/tree/declarations/ClassDeclarationNode.ts";
import type ClassMethodDeclarationNode from "../frontend/tree/declarations/ClassMethodDeclarationNode.ts";
import type ClassPropertyDeclarationNode from "../frontend/tree/declarations/ClassPropertyDeclarationNode.ts";
import type IdentifierNode from "../frontend/tree/expressions/IdentifierNode.ts";
import { ClassMethodSymbol } from "./ClassMethodSymbol.ts";
import { ClassPropertySymbol } from "./ClassPropertySymbol.ts";
import type { Scope } from "./Scope.ts";
import { SymbolDefinition } from "./SymbolDefinition.ts";

export class ClassSymbol extends SymbolDefinition {
    public override readonly node: ClassDeclarationNode;
    public readonly symbolTable = new Map<
        string,
        ClassPropertySymbol | ClassMethodSymbol
    >();

    public constructor(node: ClassDeclarationNode, hits: number = 0) {
        super(node, hits);
        this.node = node;
    }

    public buildSymbolTable(
        scope: Scope,
        symbolCollisionChecker?: (
            node: ClassMethodDeclarationNode | ClassPropertyDeclarationNode
        ) => boolean
    ) {
        for (const property of this.node.properties) {
            if (symbolCollisionChecker && !symbolCollisionChecker(property)) {
                continue;
            }

            const symbol = new ClassPropertySymbol(property, -1);
            this.symbolTable.set(property.identifier.symbol, symbol);
            scope.symbolTable.set(property.identifier.symbol, symbol);
        }

        for (const method of this.node.methods) {
            if (symbolCollisionChecker && !symbolCollisionChecker(method)) {
                continue;
            }

            const symbol = new ClassMethodSymbol(method, -1);
            this.symbolTable.set(method.identifier.symbol, symbol);
            scope.symbolTable.set(method.identifier.symbol, symbol);
        }
    }

    public override getSymbolLocation() {
        return this.node.identifier.location;
    }

    public override getIdentifier(): IdentifierNode {
        return this.node.identifier;
    }

    public override hasExportLinkage(): boolean {
        return (
            this.node.accessModifier?.value === AccessModifier.Public ||
            this.node.accessModifier?.value === AccessModifier.Internal
        );
    }
}
