import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import StatementNode from "../StatementNode.ts";

class ImportStatementNode extends StatementNode {
    public override readonly type = NodeType.ImportStatement;
    public readonly path: IdentifierNode[];
    public readonly identifier: IdentifierNode;

    public constructor(
        path: IdentifierNode[],
        identifier: IdentifierNode,
        location: Location
    ) {
        super(location);
        this.path = path;
        this.identifier = identifier;
    }
}

export default ImportStatementNode;
