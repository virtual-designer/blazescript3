import AbstractNode from "./AbstractNode.ts";
import type { AccessModifier } from "./AccessModifier.ts";
import DeclarationNode from "./DeclarationNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type IdentifierNode from "./IdentifierNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type { TypeExpressionNode } from "./TypeExpressionNode.ts";
import type VariableDeclarationKind from "./VariableDeclarationKind.ts";

class VariableDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.VariableDeclaration;
    public readonly kind: VariableDeclarationKind;
    public readonly identifier: IdentifierNode;
    public readonly annotatedType?: TypeExpressionNode;
    public readonly accessModifier: AccessModifier | null;
    public readonly value?: ExpressionNode;
    public readonly inline: boolean;

    public constructor(
        kind: VariableDeclarationKind,
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        accessModifier: AccessModifier | null,
        value: ExpressionNode | undefined,
        inline = false,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.identifier = identifier;
        this.annotatedType = annotatedType;
        this.accessModifier = accessModifier;
        this.inline = inline;
        this.value = value;
    }

    public override branches(): AbstractNode[] {
        return [
            ...super.branches(),
            this.identifier,
            this.annotatedType,
            this.value
        ].filter(x => !!x);
    }
}

export default VariableDeclarationNode;
