import ESTree from "estree";
import ClassConstructorDeclarationNode from "../../frontend/tree/declarations/ClassConstructorDeclarationNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import BlockStatementEmitter from "./BlockStatementEmitter.ts";
import FunctionDeclarationEmitter from "./FunctionDeclarationEmitter.ts";

class ClassConstructorDeclarationEmitter extends ESTreeEmitter<
    ClassConstructorDeclarationNode,
    ESTree.MethodDefinition
> {
    public override readonly NODE_TYPE = ClassConstructorDeclarationNode;

    public override emit(
        node: ClassConstructorDeclarationNode,
        context: TransformerContext
    ): EmitterResult<ESTree.MethodDefinition> {
        const body = this.transformer
            .getEmitter(BlockStatementEmitter)
            .emit(node.body, context);

        const params = this.transformer
            .getEmitter(FunctionDeclarationEmitter)
            .emitParameterList(node.parameters, context);

        return this.combine(
            {
                type: "MethodDefinition",
                computed: false,
                static: false,
                key: { type: "Identifier", name: "constructor" },
                kind: "constructor",
                value: {
                    type: "FunctionExpression",
                    async: false,
                    body: body.node,
                    params: params.map(({ node }) => node)
                }
            },
            body,
            ...params
        );
    }
}

export default ClassConstructorDeclarationEmitter;
