import DeclarationNode from "../DeclarationNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type AccessModifierNode from "./AccessModifierNode.ts";
import type ClassKindNode from "./ClassKindNode.ts";
import type ClassMethodDeclarationNode from "./ClassMethodDeclarationNode.ts";
import type { ClassModifier } from "./ClassModifier.ts";
import type ClassPropertyDeclarationNode from "./ClassPropertyDeclarationNode.ts";
import type ModifierListNode from "./ModifierListNode.ts";

class ClassDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.ClassDeclaration;
    public readonly kind: ClassKindNode;
    public readonly accessModifier: AccessModifierNode;
    public readonly modifiers: ModifierListNode<ClassModifier>;
    public readonly identifier: IdentifierNode;
    public readonly properties: Map<string, ClassPropertyDeclarationNode>;
    public readonly methods: Map<string, ClassMethodDeclarationNode>;

    public constructor(
        kind: ClassKindNode,
        accessModifier: AccessModifierNode,
        modifiers: ModifierListNode<ClassModifier>,
        identifier: IdentifierNode,
        properties: Map<string, ClassPropertyDeclarationNode>,
        methods: Map<string, ClassMethodDeclarationNode>,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.accessModifier = accessModifier;
        this.modifiers = modifiers;
        this.identifier = identifier;
        this.properties = properties;
        this.methods = methods;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.kind,
            this.accessModifier,
            this.modifiers,
            this.identifier,
            ...this.properties.values(),
            ...this.methods.values()
        ];
    }
}

export default ClassDeclarationNode;
