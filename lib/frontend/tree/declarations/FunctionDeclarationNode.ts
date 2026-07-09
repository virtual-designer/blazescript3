import NodeType from "../NodeType.ts";
import AbstractFunctionDeclarationNode from "./AbstractFunctionDeclarationNode.ts";

class FunctionDeclarationNode extends AbstractFunctionDeclarationNode {
    public override readonly type = NodeType.FunctionDeclaration;
}

export default FunctionDeclarationNode;
