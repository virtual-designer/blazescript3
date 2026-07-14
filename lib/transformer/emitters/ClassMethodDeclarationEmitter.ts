import ESTree from "estree";
import ClassMethodDeclarationNode from "../../frontend/tree/declarations/ClassMethodDeclarationNode.ts";
import { ClassMethodModifier } from "../../frontend/tree/declarations/ClassMethodModifier.ts";
import type { EmitterResult } from "../EmitterResult.ts";
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
    ): EmitterResult<ESTree.MethodDefinition> {
        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);

        const body = this.transformer
            .getEmitter(BlockStatementEmitter)
            .emit(node.body, context);

        const params = node.parameters.map(p => {
            if (!p.defaultValue) {
                return this.transformer
                    .getEmitter(IdentifierEmitter)
                    .emit(p.identifier, context) satisfies EmitterResult<
                    ESTree.FunctionDeclaration["params"][number]
                >;
            }

            const left = this.transformer
                .getEmitter(IdentifierEmitter)
                .emit(p.identifier, context);

            const right = this.transformer.transformExpression(
                p.defaultValue,
                context
            );

            return this.combine(
                {
                    type: "AssignmentPattern",
                    left: left.node,
                    right: right.node
                },
                left,
                right
            );
        });

        return this.combine(
            {
                type: "MethodDefinition",
                computed: false,
                key: identifier.node,
                kind: "method",
                static:
                    node.modifiers?.has(ClassMethodModifier.Static) ?? false,
                value: {
                    type: "FunctionExpression",
                    async: false,
                    body: body.node,
                    params: params.map(({ node }) => node)
                }
            },
            identifier,
            body,
            ...params
        );
    }
}

export default ClassMethodDeclarationEmitter;
