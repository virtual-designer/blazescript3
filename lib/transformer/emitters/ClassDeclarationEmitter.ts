import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import ClassDeclarationNode from "../../frontend/tree/declarations/ClassDeclarationNode.ts";
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
    ): ESTree.ClassDeclaration | ESTree.ExportNamedDeclaration {
        const declaration: ESTree.ClassDeclaration = {
            type: "ClassDeclaration",
            id: this.transformer
                .getEmitter(IdentifierEmitter)
                .emit(node.identifier, context),
            body: {
                type: "ClassBody",
                body: [
                    ...Array.from(node.properties.values(), property =>
                        this.transformer
                            .getEmitter(ClassPropertyDeclarationEmitter)
                            .emit(property, context)
                    ),
                    ...Array.from(node.methods.values(), method =>
                        this.transformer
                            .getEmitter(ClassMethodDeclarationEmitter)
                            .emit(method, context)
                    )
                ]
            }
        };

        if (
            node.accessModifier &&
            node.accessModifier.value !== AccessModifier.Private
        ) {
            return this.transformer.exportDeclaration(declaration);
        }

        return declaration;
    }
}

export default ClassDeclarationEmitter;
