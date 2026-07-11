import DeclarationNode from "../DeclarationNode.ts";
import type ExpressionNode from "../ExpressionNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type AnnotationNode from "./AnnotationNode.ts";

class FunctionParameterDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.FunctionParameterDeclaration;
    public readonly identifier: IdentifierNode;
    public readonly annotatedType?: TypeExpressionNode;
    public readonly defaultValue?: ExpressionNode;
    public readonly annotations: AnnotationNode[];

    public constructor(
        identifier: IdentifierNode,
        annotatedType: TypeExpressionNode | undefined,
        defaultValue: ExpressionNode | undefined,
        annotations: AnnotationNode[],
        location: Location
    ) {
        super(location);
        this.identifier = identifier;
        this.annotatedType = annotatedType;
        this.defaultValue = defaultValue;
        this.annotations = annotations;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.identifier,
            this.annotatedType,
            this.defaultValue,
            ...this.annotations
        ];
    }
}

export default FunctionParameterDeclarationNode;
