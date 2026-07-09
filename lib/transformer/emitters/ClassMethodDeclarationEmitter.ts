import ESTree from "estree";
import ClassMethodDeclarationNode from "../../frontend/tree/declarations/ClassMethodDeclarationNode.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import BlockStatementEmitter from "./BlockStatementEmitter.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class ClassMethodDeclarationEmitter extends ESTreeEmitter<
    ClassMethodDeclarationNode,
    ESTree.MethodDefinition
> {
    public override readonly NODE_TYPE = ClassMethodDeclarationNode;

    public override emit(
        node: ClassMethodDeclarationNode,
        context: TransformerContext
    ): ESTree.MethodDefinition {
        return {
            type: "MethodDefinition",
            computed: false,
            key: this.transformer
                .getEmitter(IdentifierEmitter)
                .emit(node.identifier, context),
            kind: "method",
            static: false,
            value: {
                type: "FunctionExpression",
                async: false,
                body: this.transformer
                    .getEmitter(BlockStatementEmitter)
                    .emit(node.body, context),
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
                )
            }
        };
    }
}

export default ClassMethodDeclarationEmitter;
