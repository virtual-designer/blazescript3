import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import { FunctionDeclarationModifier } from "../../frontend/tree/declarations/FunctionDeclarationModifier.ts";
import FunctionDeclarationNode from "../../frontend/tree/declarations/FunctionDeclarationNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransfomerContext.ts";
import BlockStatementEmitter from "./BlockStatementEmitter.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class FunctionDeclarationEmitter extends ESTreeEmitter<
    FunctionDeclarationNode,
    ESTree.FunctionDeclaration | ESTree.ExportNamedDeclaration
> {
    public override readonly NODE_TYPE = FunctionDeclarationNode;

    public override emit(
        node: FunctionDeclarationNode,
        context: TransformerContext
    ): ESTree.FunctionDeclaration | ESTree.ExportNamedDeclaration {
        const functionDeclaration: ESTree.FunctionDeclaration = {
            type: "FunctionDeclaration",
            body: this.transformer
                .getEmitter(BlockStatementEmitter)
                .emit(node.body, context),
            id: this.transformer
                .getEmitter(IdentifierEmitter)
                .emit(node.identifier, context),
            params: node.parameters.map(
                p =>
                    (p.defaultValue
                        ? {
                              type: "AssignmentPattern",
                              left: this.transformer
                                  .getEmitter(IdentifierEmitter)
                                  .emit(p.identifier, context),
                              right: this.transformer.transformExpression(
                                  p.defaultValue,
                                  context
                              )
                          }
                        : this.transformer
                              .getEmitter(IdentifierEmitter)
                              .emit(
                                  p.identifier,
                                  context
                              )) satisfies ESTree.FunctionDeclaration["params"][number]
            ),
            async:
                (node.functionModifiers & FunctionDeclarationModifier.Async) ===
                FunctionDeclarationModifier.Async
        };

        if (
            node.accessModifier &&
            node.accessModifier !== AccessModifier.Private
        ) {
            return this.transformer.exportDeclaration(functionDeclaration);
        }

        return functionDeclaration;
    }
}

export default FunctionDeclarationEmitter;
