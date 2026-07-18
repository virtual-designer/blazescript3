import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import { FunctionDeclarationModifier } from "../../frontend/tree/declarations/FunctionDeclarationModifier.ts";
import FunctionDeclarationNode from "../../frontend/tree/declarations/FunctionDeclarationNode.ts";
import type FunctionParameterDeclarationNode from "../../frontend/tree/declarations/FunctionParameterDeclarationNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import BlockStatementEmitter from "./BlockStatementEmitter.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class FunctionDeclarationEmitter extends ESTreeEmitter<
    FunctionDeclarationNode,
    ESTree.FunctionDeclaration | ESTree.ExportNamedDeclaration
> {
    public override readonly NODE_TYPE = FunctionDeclarationNode;

    public emitParameterList(
        parameters: FunctionParameterDeclarationNode[],
        context: TransformerContext
    ) {
        return parameters.map(p => {
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
    }

    public override emit(
        node: FunctionDeclarationNode,
        context: TransformerContext
    ): EmitterResult<
        ESTree.FunctionDeclaration | ESTree.ExportNamedDeclaration
    > {
        const params = this.emitParameterList(node.parameters, context);

        const body = this.transformer
            .getEmitter(BlockStatementEmitter)
            .emit(node.body, context);

        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);

        let declaration:
            | ESTree.FunctionDeclaration
            | ESTree.ExportNamedDeclaration = {
            type: "FunctionDeclaration",
            id: identifier.node,
            body: body.node,
            params: params.map(({ node }) => node),
            async:
                node.functionModifiers?.has(
                    FunctionDeclarationModifier.Async
                ) ?? false
        };

        if (
            node.accessModifier &&
            node.accessModifier.value !== AccessModifier.Private
        ) {
            declaration = this.transformer.exportDeclaration(
                declaration as ESTree.FunctionDeclaration
            );
        }

        return this.combine(declaration, identifier, ...params, body);
    }
}

export default FunctionDeclarationEmitter;
