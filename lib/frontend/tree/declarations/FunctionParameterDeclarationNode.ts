import DeclarationNode from "../DeclarationNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";

class FunctionParameterDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.FunctionParameterDeclaration;
    public readonly identifier: IdentifierNode;
    public readonly annotatedType?: TypeExpressionNode;
    public readonly defaultValue?: ExpressionNode;

    public constructor(
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        defaultValue: ExpressionNode | undefined,
        location: Location
    ) {
        super(location);
        this.identifier = identifier;
        this.annotatedType = annotatedType;
        this.defaultValue = defaultValue;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.identifier,
            this.annotatedType,
            this.defaultValue
        ];
    }
}

export default FunctionParameterDeclarationNode;
