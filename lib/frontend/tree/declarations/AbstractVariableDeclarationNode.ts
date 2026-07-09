import DeclarationNode from "../DeclarationNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type VariableDeclarationKindNode from "./VariableDeclarationKindNode.ts";

abstract class AbstractVariableDeclarationNode extends DeclarationNode {
    public readonly kind: VariableDeclarationKindNode;
    public readonly identifier: IdentifierNode;
    public readonly annotatedType?: TypeExpressionNode;
    public readonly accessModifier: AccessModifierNode | null;
    public readonly defaultValue?: ExpressionNode;

    public constructor(
        kind: VariableDeclarationKindNode,
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        accessModifier: AccessModifierNode | null,
        value: ExpressionNode | undefined,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.identifier = identifier;
        this.annotatedType = annotatedType;
        this.accessModifier = accessModifier;
        this.defaultValue = value;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.kind,
            this.identifier,
            this.annotatedType,
            this.defaultValue,
            this.accessModifier
        ];
    }
}

export default AbstractVariableDeclarationNode;
