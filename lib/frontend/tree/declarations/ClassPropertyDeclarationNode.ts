import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import AbstractVariableDeclarationNode from "./AbstractVariableDeclarationNode.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type AnnotationNode from "./AnnotationNode.ts";
import type { ClassPropertyModifier } from "./ClassPropertyModifier.ts";
import type ModifierListNode from "./ModifierListNode.ts";
import type VariableDeclarationKindNode from "./VariableDeclarationKindNode.ts";

class ClassPropertyDeclarationNode extends AbstractVariableDeclarationNode {
    public override readonly type = NodeType.ClassPropertyDeclaration;
    public readonly modifiers: ModifierListNode<ClassPropertyModifier> | null;
    public readonly annotations: AnnotationNode[];

    public constructor(
        kind: VariableDeclarationKindNode,
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        accessModifier: AccessModifierNode | null,
        modifiers: ModifierListNode<ClassPropertyModifier> | null,
        defaultValue: ExpressionNode | undefined,
        annotations: AnnotationNode[],
        location: Location
    ) {
        super(
            kind,
            identifier,
            annotatedType,
            accessModifier,
            defaultValue,
            location
        );

        this.modifiers = modifiers;
        this.annotations = annotations;
    }

    public override branches() {
        return [...super.branches(), this.modifiers, ...this.annotations];
    }
}

export default ClassPropertyDeclarationNode;
