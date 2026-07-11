import DeclarationNode from "../DeclarationNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import type BlockStatementNode from "../statements/BlockStatementNode.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type AnnotationNode from "./AnnotationNode.ts";
import { FunctionDeclarationModifier } from "./FunctionDeclarationModifier.ts";
import type FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";
import type ModifierListNode from "./ModifierListNode.ts";

abstract class AbstractFunctionDeclarationNode extends DeclarationNode {
    public readonly identifier: IdentifierNode;
    public readonly returnType?: TypeExpressionNode;
    public readonly parameters: FunctionParameterDeclarationNode[];
    public readonly accessModifier: AccessModifierNode | null;
    public readonly functionModifiers: ModifierListNode<FunctionDeclarationModifier> | null;
    public readonly annotations: AnnotationNode[];
    public readonly body: BlockStatementNode;

    public constructor(
        identifier: IdentifierNode,
        returnType: TypeExpressionNode | undefined,
        parameters: FunctionParameterDeclarationNode[],
        accessModifier: AccessModifierNode | null,
        functionModifiers: ModifierListNode<FunctionDeclarationModifier> | null,
        annotations: AnnotationNode[],
        body: BlockStatementNode,
        location: Location
    ) {
        super(location);
        this.identifier = identifier;
        this.returnType = returnType;
        this.parameters = parameters;
        this.accessModifier = accessModifier;
        this.functionModifiers = functionModifiers;
        this.annotations = annotations;
        this.body = body;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.functionModifiers,
            this.accessModifier,
            this.identifier,
            this.returnType,
            ...this.parameters,
            ...this.annotations,
            this.body
        ];
    }
}

export default AbstractFunctionDeclarationNode;
