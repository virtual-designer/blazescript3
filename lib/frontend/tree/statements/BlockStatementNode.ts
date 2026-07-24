import type { Scope } from "../../../analysis/Scope.ts";
import NodeType from "../NodeType.ts";
import StatementNodeWithChildren from "../StatementNodeWithChildren.ts";

class BlockStatementNode extends StatementNodeWithChildren {
    public override readonly type = NodeType.BlockStatement;
    private scope: Scope | null = null;

    public getScope() {
        return this.scope;
    }

    public setScope(scope: Scope) {
        this.scope = scope;
    }
}

export default BlockStatementNode;
