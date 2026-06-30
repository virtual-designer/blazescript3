import type { AccessModifier } from "./AccessModifier.ts";
import type BlockStatementNode from "./BlockStatementNode.ts";
import DeclarationNode from "./DeclarationNode.ts";
import { FunctionDeclarationModifier } from "./FunctionDeclarationModifier.ts";
import type FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";
import type IdentifierNode from "./IdentifierNode.ts";
import type { Location } from "./Location.ts";
import NodeType from "./NodeType.ts";
import type { TypeExpressionNode } from "./TypeExpressionNode.ts";

class FunctionDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.FunctionDeclaration;
    public readonly identifier: IdentifierNode;
    public readonly returnType?: TypeExpressionNode;
    public readonly parameters: FunctionParameterDeclarationNode[];
    public readonly accessModifier: AccessModifier | null;
    public readonly functionModifiers: FunctionDeclarationModifier;
    public readonly body: BlockStatementNode;

    public constructor(
        identifier: IdentifierNode,
        returnType: TypeExpressionNode | undefined,
        parameters: FunctionParameterDeclarationNode[],
        accessModifier: AccessModifier | null,
        functionModifiers: FunctionDeclarationModifier | null,
        body: BlockStatementNode,
        location: Location
    ) {
        super(location);
        this.identifier = identifier;
        this.returnType = returnType;
        this.parameters = parameters;
        this.accessModifier = accessModifier;
        this.functionModifiers =
            functionModifiers ?? FunctionDeclarationModifier.None;
        this.body = body;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.identifier,
            this.returnType,
            ...this.parameters,
            this.body
        ];
    }
}

export default FunctionDeclarationNode;
