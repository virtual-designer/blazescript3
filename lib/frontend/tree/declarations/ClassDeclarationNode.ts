import DeclarationNode from "../DeclarationNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type AnnotationNode from "./AnnotationNode.ts";
import type ClassConstructorDeclarationNode from "./ClassConstructorDeclarationNode.ts";
import type ClassKindNode from "./ClassKindNode.ts";
import type ClassMethodDeclarationNode from "./ClassMethodDeclarationNode.ts";
import type { ClassModifier } from "./ClassModifier.ts";
import type ClassPropertyDeclarationNode from "./ClassPropertyDeclarationNode.ts";
import type ModifierListNode from "./ModifierListNode.ts";

class ClassDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.ClassDeclaration;
    public readonly kind: ClassKindNode;
    public readonly accessModifier: AccessModifierNode | null;
    public readonly modifiers: ModifierListNode<ClassModifier> | null;
    public readonly identifier: IdentifierNode;
    public readonly properties: Map<string, ClassPropertyDeclarationNode>;
    public readonly methods: Map<string, ClassMethodDeclarationNode>;
    public readonly constructors: ClassConstructorDeclarationNode[];
    public readonly annotations: AnnotationNode[];

    public constructor(
        kind: ClassKindNode,
        accessModifier: AccessModifierNode | null,
        modifiers: ModifierListNode<ClassModifier> | null,
        identifier: IdentifierNode,
        properties: Map<string, ClassPropertyDeclarationNode>,
        methods: Map<string, ClassMethodDeclarationNode>,
        constructors: ClassConstructorDeclarationNode[],
        annotations: AnnotationNode[],
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.accessModifier = accessModifier;
        this.modifiers = modifiers;
        this.identifier = identifier;
        this.properties = properties;
        this.methods = methods;
        this.constructors = constructors;
        this.annotations = annotations;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.kind,
            this.accessModifier,
            this.modifiers,
            this.identifier,
            ...this.properties.values(),
            ...this.methods.values(),
            ...this.constructors,
            ...this.annotations
        ];
    }
}

export type ClassMemberDeclarationNode =
    | ClassConstructorDeclarationNode
    | ClassPropertyDeclarationNode
    | ClassMethodDeclarationNode;

export default ClassDeclarationNode;
