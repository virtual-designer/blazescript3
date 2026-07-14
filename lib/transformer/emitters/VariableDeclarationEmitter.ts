import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import VariableDeclarationKind from "../../frontend/tree/declarations/VariableDeclarationKind.ts";
import VariableDeclarationNode from "../../frontend/tree/declarations/VariableDeclarationNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<
        ESTree.VariableDeclaration | ESTree.ExportNamedDeclaration
    > {
        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);
        const init = node.defaultValue
            ? this.transformer.transformExpression(node.defaultValue, context)
            : undefined;

        let variableDeclaration:
            | ESTree.VariableDeclaration
            | ESTree.ExportNamedDeclaration = {
            type: "VariableDeclaration",
            kind:
                node.kind.value === VariableDeclarationKind.Let
                    ? "let"
                    : "const",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: identifier.node,
                    init: init?.node
                }
            ]
        };

        if (
            node.accessModifier &&
            node.accessModifier.value !== AccessModifier.Private
        ) {
            variableDeclaration = this.transformer.exportDeclaration(
                variableDeclaration as ESTree.VariableDeclaration
            );
        }

        return this.combine(variableDeclaration, identifier, init);
    }
}

export default VariableDeclarationEmitter;
