import ESTree from "estree";
import ClassPropertyDeclarationNode from "../../frontend/tree/declarations/ClassPropertyDeclarationNode.ts";
import { ClassPropertyModifier } from "../../frontend/tree/declarations/ClassPropertyModifier.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.PropertyDefinition> {
        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);

        const value = node.defaultValue
            ? this.transformer.transformExpression(node.defaultValue, context)
            : undefined;

        return this.combine(
            {
                type: "PropertyDefinition",
                key: identifier.node,
                computed: false,
                static:
                    node.modifiers?.has(ClassPropertyModifier.Static) ?? false,
                value: value?.node
            },
            identifier,
            value
        );
    }
}

export default ClassPropertyDeclarationEmitter;
