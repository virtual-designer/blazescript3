import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import VariableDeclarationKind from "../../frontend/tree/declarations/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../../frontend/tree/declarations/VariableDeclarationNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class VariableDeclarationEmitter extends ESTreeEmitter<
    VariableDeclarationNode,
    ESTree.VariableDeclaration | ESTree.ExportNamedDeclaration
> {
    public override readonly NODE_TYPE = VariableDeclarationNode;

    public override emit(
        node: VariableDeclarationNode,
        context: TransformerContext
    ): ESTree.VariableDeclaration | ESTree.ExportNamedDeclaration {
        const variableDeclaration: ESTree.VariableDeclaration = {
            type: "VariableDeclaration",
            kind:
                node.kind.value === VariableDeclarationKind.Let
                    ? "let"
                    : "const",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: this.transformer
                        .getEmitter(IdentifierEmitter)
                        .emit(node.identifier, context),
                    init: node.defaultValue
                        ? (this.transformer.transformExpression(
                              node.defaultValue,
                              context
                          ) as ESTree.Expression)
                        : undefined
                }
            ]
        };

        if (
            node.accessModifier &&
            node.accessModifier.value !== AccessModifier.Private
        ) {
            return this.transformer.exportDeclaration(variableDeclaration);
        }

        return variableDeclaration;
    }
}

export default VariableDeclarationEmitter;
