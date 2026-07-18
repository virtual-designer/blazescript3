import DeclarationNode from "../DeclarationNode.ts";
import { type Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type BlockStatementNode from "../statements/BlockStatementNode.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type AnnotationNode from "./AnnotationNode.ts";
import type FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";

class ClassConstructorDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.ClassConstructorDeclaration;

    public readonly parameters: FunctionParameterDeclarationNode[];
    public readonly accessModifier: AccessModifierNode | null;
    public readonly annotations: AnnotationNode[];
    public readonly body: BlockStatementNode;

    public constructor(
        parameters: FunctionParameterDeclarationNode[],
        accessModifier: AccessModifierNode | null,
        annotations: AnnotationNode[],
        body: BlockStatementNode,
        location: Location
    ) {
        super(location);

        this.parameters = parameters;
        this.accessModifier = accessModifier;
        this.annotations = annotations;
        this.body = body;
    }

    public override branches() {
        return [
            ...super.branches(),
            ...this.parameters,
            this.accessModifier,
            ...this.annotations,
            this.body
        ];
    }
}

export default ClassConstructorDeclarationNode;
