import ESTree from "estree";
import { AccessModifier } from "../../frontend/tree/declarations/AccessModifier.ts";
import type AnnotationNode from "../../frontend/tree/declarations/AnnotationNode.ts";
import ClassDeclarationNode from "../../frontend/tree/declarations/ClassDeclarationNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import ClassConstructorDeclarationEmitter from "./ClassConstructorDeclarationEmitter.ts";
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
    ): EmitterResult<ESTree.ClassDeclaration | ESTree.ExportNamedDeclaration> {
        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);

        const properties = Array.from(node.properties.values(), property =>
            this.transformer
                .getEmitter(ClassPropertyDeclarationEmitter)
                .emit(property, context)
        );

        const methods = Array.from(node.methods.values(), method =>
            this.transformer
                .getEmitter(ClassMethodDeclarationEmitter)
                .emit(method, context)
        );

        const constructors = node.constructors.map(constructor =>
            this.transformer
                .getEmitter(ClassConstructorDeclarationEmitter)
                .emit(constructor, context)
        );

        let declaration:
            | ESTree.ClassDeclaration
            | ESTree.ExportNamedDeclaration = {
            type: "ClassDeclaration",
            id: identifier.node,
            body: {
                type: "ClassBody",
                body: [
                    ...properties.map(({ node }) => node),
                    ...constructors.map(({ node }) => node),
                    ...methods.map(({ node }) => node)
                ]
            }
        };

        const annotationApplicationCalls = [];

        for (const annotation of node.annotations) {
            annotationApplicationCalls.push(
                this.makeAnnotationApplicationCall(
                    identifier.node,
                    annotation,
                    context
                )
            );
        }

        if (
            node.accessModifier &&
            node.accessModifier.value !== AccessModifier.Private
        ) {
            declaration = this.transformer.exportDeclaration(
                declaration as ESTree.ClassDeclaration
            );
        }

        const combined = this.combine(
            declaration,
            identifier,
            ...properties,
            ...constructors,
            ...methods
        );

        combined.nextNodes ??= [];

        for (const call of annotationApplicationCalls) {
            combined.nextNodes.push(...(call.previousNodes ?? []));
            combined.nextNodes.push(call.node);
            combined.nextNodes.push(...(call.nextNodes ?? []));
        }

        return combined;
    }

    private makeAnnotationApplicationCall(
        identifier: ESTree.Identifier,
        annotation: AnnotationNode,
        context: TransformerContext
    ): EmitterResult<ESTree.ExpressionStatement> {
        const callee = this.transformer.transformExpression(
            annotation.callee,
            context
        );

        const args = annotation.args.map(arg =>
            this.transformer.transformExpression(arg, context)
        );

        const previousNodes = args.flatMap(arg => arg.previousNodes ?? []);
        const nextNodes = args.flatMap(arg => arg.nextNodes ?? []);

        const innerVariable = this.transformer.randomSymbolName("value");

        return this.combine(
            {
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    callee: {
                        type: "MemberExpression",
                        object: {
                            type: "MemberExpression",
                            object: {
                                type: "Identifier",
                                name: this.transformer.BLAZE_GLOBAL_SYMBOL
                            },
                            property: {
                                type: "Identifier",
                                name: "reflection"
                            },
                            computed: false,
                            optional: false
                        },
                        property: {
                            type: "Identifier",
                            name: "applyAnnotationToClass"
                        },
                        computed: false,
                        optional: false
                    },
                    optional: false,
                    arguments: [
                        identifier,
                        callee.node,
                        ...(annotation.args.length === 0
                            ? []
                            : [
                                  {
                                      type: "ArrowFunctionExpression",
                                      expression:
                                          previousNodes.length === 0 &&
                                          nextNodes.length === 0,
                                      body:
                                          previousNodes.length === 0 &&
                                          nextNodes.length === 0
                                              ? {
                                                    type: "ArrayExpression",
                                                    elements: args.map(
                                                        ({ node }) => node
                                                    )
                                                }
                                              : {
                                                    type: "BlockStatement",
                                                    body: [
                                                        ...(previousNodes as ESTree.Statement[]),
                                                        {
                                                            type: "VariableDeclaration",
                                                            kind: "const",
                                                            declarations: [
                                                                {
                                                                    type: "VariableDeclarator",
                                                                    id: {
                                                                        type: "Identifier",
                                                                        name: innerVariable
                                                                    },
                                                                    init: {
                                                                        type: "ArrayExpression",
                                                                        elements:
                                                                            args.map(
                                                                                ({
                                                                                    node
                                                                                }) =>
                                                                                    node
                                                                            )
                                                                    }
                                                                }
                                                            ]
                                                        },
                                                        ...(nextNodes as ESTree.Statement[]),
                                                        {
                                                            type: "ReturnStatement",
                                                            argument: {
                                                                type: "Identifier",
                                                                name: innerVariable
                                                            }
                                                        }
                                                    ]
                                                },
                                      params: []
                                  } satisfies ESTree.ArrowFunctionExpression
                              ])
                    ]
                }
            },
            callee
        );
    }
}

export default ClassDeclarationEmitter;
