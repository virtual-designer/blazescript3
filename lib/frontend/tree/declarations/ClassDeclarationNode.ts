import DeclarationNode from "../DeclarationNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type { AccessModifier } from "./AccessModifier.ts";
import type { ClassKind } from "./ClassKind.ts";
import type { ClassModifier } from "./ClassModifier.ts";

class ClassDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.ClassDeclaration;
    public readonly kind: ClassKind;
    public readonly accessModifier: AccessModifier;
    public readonly modifiers: ClassModifier;
    public readonly identifier: IdentifierNode;

    public constructor(
        kind: ClassKind,
        accessModifier: AccessModifier,
        modifiers: ClassModifier,
        identifier: IdentifierNode,
        location: Location
    ) {
        super(location);
        this.kind = kind;
        this.accessModifier = accessModifier;
        this.modifiers = modifiers;
        this.identifier = identifier;
    }
}

export default ClassDeclarationNode;
