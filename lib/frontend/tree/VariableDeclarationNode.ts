import BaseNode from "./BaseNode.ts";
import type ExpressionNode from "./ExpressionNode.ts";
import type IdentifierNode from "./IdentifierNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type { TypeExpressionNode } from "./TypeExpressionNode.ts";
import type VariableDeclarationKind from "./VariableDeclarationKind.ts";

class VariableDeclarationNode extends BaseNode {
    public override readonly type = NodeType.VariableDeclaration;
    public readonly kind: VariableDeclarationKind;
    public readonly identifier: IdentifierNode;
    public readonly annotatedType?: TypeExpressionNode;
    public readonly value?: ExpressionNode;
    public readonly inline: boolean;

    public constructor(
        kind: VariableDeclarationKind,
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        value: ExpressionNode | undefined,
        inline = false,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.identifier = identifier;
        this.annotatedType = annotatedType;
        this.inline = inline;
        this.value = value;
    }

    public override branches(): BaseNode[] {
        return [
            ...super.branches(),
            this.identifier,
            this.annotatedType,
            this.value
        ].filter(x => !!x);
    }
}

export default VariableDeclarationNode;
