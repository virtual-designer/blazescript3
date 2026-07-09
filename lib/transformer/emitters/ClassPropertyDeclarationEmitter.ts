import ESTree from "estree";
import ClassPropertyDeclarationNode from "../../frontend/tree/declarations/ClassPropertyDeclarationNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class ClassPropertyDeclarationEmitter extends ESTreeEmitter<
    ClassPropertyDeclarationNode,
    ESTree.PropertyDefinition
> {
    public override readonly NODE_TYPE = ClassPropertyDeclarationNode;

    public override emit(
        node: ClassPropertyDeclarationNode,
        context: TransformerContext
    ): ESTree.PropertyDefinition {
        return {
            type: "PropertyDefinition",
            key: this.transformer
                .getEmitter(IdentifierEmitter)
                .emit(node.identifier, context),
            computed: false,
            static: false,
            value: node.defaultValue
                ? this.transformer.transformExpression(
                      node.defaultValue,
                      context
                  )
                : undefined
        };
    }
}

export default ClassPropertyDeclarationEmitter;
