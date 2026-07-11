import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import { type Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type BlockStatementNode from "../statements/BlockStatementNode.ts";
import AbstractFunctionDeclarationNode from "./AbstractFunctionDeclarationNode.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type AnnotationNode from "./AnnotationNode.ts";
import type { ClassMethodModifier } from "./ClassMethodModifier.ts";
import type { FunctionDeclarationModifier } from "./FunctionDeclarationModifier.ts";
import type FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";
import type ModifierListNode from "./ModifierListNode.ts";

class ClassMethodDeclarationNode extends AbstractFunctionDeclarationNode {
    public override readonly type = NodeType.ClassMethodDeclaration;
    public readonly modifiers: ModifierListNode<ClassMethodModifier> | null;

    public constructor(
        identifier: IdentifierNode,
        returnType: TypeExpressionNode | undefined,
        parameters: FunctionParameterDeclarationNode[],
        accessModifier: AccessModifierNode | null,
        modifiers: ModifierListNode<ClassMethodModifier> | null,
        functionModifiers: ModifierListNode<FunctionDeclarationModifier> | null,
        annotations: AnnotationNode[],
        body: BlockStatementNode,
        location: Location
    ) {
        super(
            identifier,
            returnType,
            parameters,
            accessModifier,
            functionModifiers,
            annotations,
            body,
            location
        );
        this.modifiers = modifiers;
    }

    public override branches() {
        return [...super.branches(), this.modifiers];
    }
}

export default ClassMethodDeclarationNode;
