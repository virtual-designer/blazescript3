import BaseNode from "./BaseNode.ts";
import type FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";
import type IdentifierNode from "./IdentifierNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type { TypeExpressionNode } from "./TypeExpressionNode.ts";

class FunctionDeclarationNode extends BaseNode {
    public override readonly type = NodeType.FunctionDeclaration;
    public readonly identifier: IdentifierNode;
    public readonly returnType?: TypeExpressionNode;
    public readonly parameters: FunctionParameterDeclarationNode[];
    public readonly body: BaseNode[];

    public constructor(
        identifier: IdentifierNode,
        returnType: TypeExpressionNode | undefined,
        parameters: FunctionParameterDeclarationNode[],
        body: BaseNode[],
        location: Location
    ) {
        super(location);
        this.identifier = identifier;
        this.returnType = returnType;
        this.parameters = parameters;
        this.body = body;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.identifier,
            this.returnType,
            ...this.parameters,
            ...this.body
        ];
    }
}

export default FunctionDeclarationNode;
