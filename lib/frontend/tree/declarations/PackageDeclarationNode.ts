import DeclarationNode from "../DeclarationNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";

class PackageDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.PackageDeclaration;
    public readonly path: IdentifierNode[];

    public constructor(path: IdentifierNode[], location: Location) {
        super(location);
        this.path = path;
    }
}

export default PackageDeclarationNode;
