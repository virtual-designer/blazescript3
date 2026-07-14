import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import ClassDeclarationNode from "../../frontend/tree/declarations/ClassDeclarationNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import ClassMethodDeclarationEmitter from "./ClassMethodDeclarationEmitter.ts";
import ClassPropertyDeclarationEmitter from "./ClassPropertyDeclarationEmitter.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class ClassDeclarationEmitter extends ESTreeEmitter<
    ClassDeclarationNode,
    ESTree.ClassDeclaration | ESTree.ExportNamedDeclaration
> {
    public override readonly NODE_TYPE = ClassDeclarationNode;

    public override emit(
        node: ClassDeclarationNode,
        context: TransformerContext
    ): EmitterResult<ESTree.ClassDeclaration | ESTree.ExportNamedDeclaration> {
        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);
        const properties = Array.from(node.properties.values(), property =>
            this.transformer
                .getEmitter(ClassPropertyDeclarationEmitter)
                .emit(property, context)
        );
        const methods = Array.from(node.methods.values(), method =>
            this.transformer
                .getEmitter(ClassMethodDeclarationEmitter)
                .emit(method, context)
        );

        let declaration:
            | ESTree.ClassDeclaration
            | ESTree.ExportNamedDeclaration = {
            type: "ClassDeclaration",
            id: identifier.node,
            body: {
                type: "ClassBody",
                body: [
                    ...properties.map(({ node }) => node),
                    ...methods.map(({ node }) => node)
                ]
            }
        };

        if (
            node.accessModifier &&
            node.accessModifier.value !== AccessModifier.Private
        ) {
            declaration = this.transformer.exportDeclaration(
                declaration as ESTree.ClassDeclaration
            );
        }

        return this.combine(declaration, identifier, ...properties, ...methods);
    }
}

export default ClassDeclarationEmitter;
