import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import AbstractVariableDeclarationNode from "./AbstractVariableDeclarationNode.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type VariableDeclarationKindNode from "./VariableDeclarationKindNode.ts";

class VariableDeclarationNode extends AbstractVariableDeclarationNode {
    public override readonly type = NodeType.VariableDeclaration;
    public readonly inline: boolean;

    public constructor(
        kind: VariableDeclarationKindNode,
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        accessModifier: AccessModifierNode | null,
        defaultValue: ExpressionNode | undefined,
        inline = false,
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

        this.inline = inline;
    }
}

export default VariableDeclarationNode;
