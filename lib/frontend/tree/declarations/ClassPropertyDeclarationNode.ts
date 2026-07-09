import DeclarationNode from "../DeclarationNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type { AccessModifier } from "./AccessModifier.ts";
import type { ClassPropertyModifier } from "./ClassPropertyModifier.ts";

class ClassPropertyDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.ClassPropertyDeclaration;

    public readonly accessModifier: AccessModifier;
    public readonly modifiers: ClassPropertyModifier;
    public readonly identifier: IdentifierNode;
    public readonly annotatedType: TypeExpressionNode | null;
    public readonly defaultValue: ExpressionNode | null;

    public constructor(
        accessModifier: AccessModifier,
        modifiers: ClassPropertyModifier,
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | null,
        defaultValue: ExpressionNode | null,
        location: Location
    ) {
        super(location);
        this.accessModifier = accessModifier;
        this.modifiers = modifiers;
        this.identifier = identifier;
        this.annotatedType = annotatedType;
        this.defaultValue = defaultValue;
    }
}

export default ClassPropertyDeclarationNode;
